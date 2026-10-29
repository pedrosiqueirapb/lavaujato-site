import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { StorageService } from '@/lib/services/storage.service';
import { AsaasService } from '@/lib/services/asaas.service';
import { buildPixPayload } from '@/lib/utils/pix';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { PaymentMethod } from '@/lib/types';
import { safeMessage, GENERIC_ERROR } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

function isAuthenticated(): boolean {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return !!verifySessionToken(token)?.authenticated;
}

/** Erros 4xx são validações escritas por nós (seguras). Erros 5xx nunca expõem detalhes técnicos. */
const errorResponse = (e: unknown, status = 500) => {
  if (status >= 500) {
    console.error('[admin]', e);
    return NextResponse.json({ error: safeMessage(e) }, { status });
  }
  return NextResponse.json({ error: e instanceof Error ? e.message : GENERIC_ERROR }, { status });
};

function isValidCpfCnpj(v: string): boolean {
  const d = (v || '').replace(/\D/g, '');
  if (d.length === 11) {
    if (/^(\d)\1+$/.test(d)) return false;
    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
  }
  return d.length === 14;
}

export async function GET(request: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const url = new URL(request.url);
    if (url.searchParams.get('resource') === 'asaasCustomers') {
      const customers = await AsaasService.listCustomers();
      return NextResponse.json({ customers });
    }

    const [clients, services, plans, workspacePhotos, portfolioPosts, promotions, products, paymentLinks, config] =
      await Promise.all([
        StorageService.getClients(),
        StorageService.getServices(),
        StorageService.getPlans(),
        StorageService.getWorkspacePhotos(),
        StorageService.getPortfolioPosts(),
        StorageService.getPromotions(false),
        StorageService.getProducts(false),
        StorageService.getPaymentLinks(),
        StorageService.getSiteConfig(),
      ]);

    const stats = {
      totalClients: clients.length,
      activeServices: services.filter(s => s.isActive).length,
      activePlans: plans.length,
      activePromos: promotions.filter(p => p.isActive).length,
      totalProducts: products.length,
      pendingChargesCount: paymentLinks.length,
    };

    return NextResponse.json({
      config, clients, services, plans, workspacePhotos, portfolioPosts, promotions, products, paymentLinks, stats,
    });
  } catch (e) {
    console.error('Erro GET admin:', e);
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { action, resource, data, id } = body;

    if (action === 'reorder' && Array.isArray(data?.ids)) {
      await StorageService.reorderItems(resource, data.ids);
      return NextResponse.json({ success: true });
    }

    // CLIENTES (sincronizado com o Asaas)
    if (resource === 'client') {
      if (action === 'delete') {
        await StorageService.deleteClient(id);
        return NextResponse.json({ success: true });
      }
      if (!data?.name?.trim() || !data?.phone?.trim() || !data?.address?.trim()) {
        return errorResponse(new Error('Preencha nome, telefone e endereço.'), 400);
      }
      if (!isValidCpfCnpj(data.cpfCnpj)) {
        return errorResponse(new Error('CPF/CNPJ inválido.'), 400);
      }
      // Cria/atualiza no Asaas ANTES de salvar: se o Asaas recusar, nada é gravado.
      const asaasCustomerId = await AsaasService.upsertCustomer({
        asaasCustomerId: data.asaasCustomerId,
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        phone: data.phone,
        email: data.email,
        address: data.address,
      });
      const client = await StorageService.upsertClient({ ...data, asaasCustomerId });
      return NextResponse.json({ success: true, client });
    }

    // LINKS DE PAGAMENTO
    if (resource === 'paymentLink') {
      if (action === 'delete') {
        const links = await StorageService.getPaymentLinks();
        const link = links.find(l => l.id === id);
        if (link) await AsaasService.cancel(link);
        await StorageService.updatePaymentLinkStatus(id, 'CANCELLED');
        return NextResponse.json({ success: true });
      }
      if (action === 'create') {
        const { asaasCustomerId, customerName, description, itemType, itemId, petSize } = data || {};
        if (!asaasCustomerId || !itemType || !itemId) {
          return errorResponse(new Error('Selecione o cliente e o serviço/plano.'), 400);
        }

        let itemName = '';
        let value = Number(data.value);
        let paymentMethod: PaymentMethod = data.paymentMethod;
        let installmentCount = Math.min(Math.max(Number(data.installmentCount) || 1, 1), 6);
        const chargeType = itemType === 'plan' ? 'RECURRENT' : 'SINGLE';

        if (itemType === 'plan') {
          const plan = await StorageService.getPlanById(itemId);
          if (!plan) return errorResponse(new Error('Plano não encontrado.'), 404);
          itemName = plan.name;
          const priceMap: Record<string, number | undefined> = {
            Pequeno: plan.priceSmall, Médio: plan.priceMedium, Grande: plan.priceLarge,
          };
          value = Number(priceMap[petSize] ?? value);
          paymentMethod = 'CREDIT_CARD';
          installmentCount = 1;
        } else {
          const service = await StorageService.getServiceById(itemId);
          if (!service) return errorResponse(new Error('Serviço não encontrado.'), 404);
          itemName = service.title;
        }

        if (!value || value <= 0) return errorResponse(new Error('Informe um valor válido.'), 400);
        if (!['PIX', 'CREDIT_CARD', 'BOTH'].includes(paymentMethod)) {
          return errorResponse(new Error('Forma de pagamento inválida.'), 400);
        }

        const desc = description?.trim() || `${itemName}${petSize ? ` (porte ${petSize.toLowerCase()})` : ''} - Lav Au Jato`;
        let asaasPaymentId: string | undefined;
        let asaasSubscriptionId: string | undefined;
        let cardUrl: string | undefined;
        let pixPayload: string | undefined;

        if (chargeType === 'RECURRENT') {
          const pl = await AsaasService.createPaymentLink({ name: `${itemName} - ${customerName}`, value, description: desc, recurrent: true, installmentCount: 1 });
          asaasPaymentId = pl.id;
          cardUrl = pl.url;
        } else {
          if (paymentMethod !== 'PIX') {
            const pl = await AsaasService.createPaymentLink({ name: `${itemName} - ${customerName}`, value, description: desc, recurrent: false, installmentCount });
            asaasPaymentId = pl.id;
            cardUrl = pl.url;
          }
          if (paymentMethod !== 'CREDIT_CARD') {
            pixPayload = buildPixPayload({ amount: value, txid: `LAJ${Date.now()}` });
          }
        }

        const link = await StorageService.addPaymentLink({
          asaasCustomerId, customerName, description: desc, itemType, itemId, itemName,
          petSize: itemType === 'plan' ? petSize : undefined,
          value, chargeType, paymentMethod, installmentCount,
          asaasPaymentId, asaasSubscriptionId, cardUrl, pixPayload,
        });
        return NextResponse.json({ success: true, link });
      }
    }

    // CONTEÚDO DO SITE
    const handlers: Record<string, { del: (id: string) => Promise<any>; save: (d: any) => Promise<any> }> = {
      service: { del: StorageService.deleteService, save: d => StorageService.upsertService(d) },
      plan: { del: StorageService.deletePlan, save: d => StorageService.upsertPlan(d) },
      portfolio: { del: StorageService.deletePortfolioPost, save: d => StorageService.upsertPortfolioPost(d) },
      workspace: { del: StorageService.deleteWorkspacePhoto, save: d => StorageService.upsertWorkspacePhoto(d) },
      promotion: { del: StorageService.deletePromotion, save: d => StorageService.upsertPromotion(d) },
      product: { del: StorageService.deleteProduct, save: d => StorageService.upsertProduct(d) },
    };
    if (handlers[resource]) {
      if (action === 'delete') {
        await handlers[resource].del(id);
        return NextResponse.json({ success: true });
      }
      const item = await handlers[resource].save(data);
      return NextResponse.json({ success: true, item });
    }

    if (resource === 'config') {
      const config = await StorageService.updateSiteConfig(data);
      return NextResponse.json({ success: true, config });
    }

    return errorResponse(new Error('Ação ou recurso inválido.'), 400);
  } catch (e) {
    console.error('Erro na rota admin:', e);
    return errorResponse(e);
  }
}
