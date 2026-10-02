import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { StorageService } from '@/lib/services/storage.service';
import { AsaasService } from '@/lib/services/asaas.service';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/security/session';

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return !!session?.authenticated;
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const clients = StorageService.getClients();
  const services = StorageService.getServices();
  const plans = StorageService.getPlans();
  const workspacePhotos = StorageService.getWorkspacePhotos();
  const portfolioPosts = StorageService.getPortfolioPosts();
  const promotions = StorageService.getPromotions(false);
  const products = StorageService.getProducts(false);
  const charges = StorageService.getCharges();
  const config = StorageService.getSiteConfig();

  const stats = {
    totalClients: clients.length,
    activeServices: services.filter(s => s.isActive).length,
    activePlans: plans.length,
    activePromos: promotions.filter(p => p.isActive).length,
    totalProducts: products.length,
    pendingChargesCount: charges.filter(c => c.status === 'PENDING').length,
  };

  return NextResponse.json({
    config,
    clients,
    services,
    plans,
    workspacePhotos,
    portfolioPosts,
    promotions,
    products,
    charges,
    stats,
  });
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, resource, data, id } = body;

    // 1. CLIENTES (Com Sync Asaas)
    if (resource === 'client') {
      if (action === 'delete') {
        StorageService.deleteClient(id);
        return NextResponse.json({ success: true });
      }
      
      // Sync automático no Asaas (Requisito 10)
      let asaasCustomerId = data.asaasCustomerId;
      if (!asaasCustomerId || asaasCustomerId.startsWith('cus_demo') || asaasCustomerId.startsWith('cus_fallback')) {
        asaasCustomerId = await AsaasService.syncCustomer({
          name: data.name,
          phone: data.phone,
          email: data.email,
          cpfCnpj: data.cpfCnpj,
        });
      }

      const client = StorageService.upsertClient({
        ...data,
        asaasCustomerId,
      });

      return NextResponse.json({ success: true, client });
    }

    // 2. GERADOR DE COBRANÇAS ASAAS (Requisito 6 & 7)
    if (resource === 'charge' && action === 'create') {
      const charge = await AsaasService.createCharge({
        customerId: data.customerId,
        customerName: data.customerName,
        value: Number(data.value),
        description: data.description,
        billingType: data.billingType,
        cycle: data.cycle,
        installmentCount: data.installmentCount ? Number(data.installmentCount) : undefined,
      });
      return NextResponse.json({ success: true, charge });
    }

    if (resource === 'charge' && action === 'delete') {
      StorageService.markChargeDeleted(id);
      return NextResponse.json({ success: true });
    }

    // 3. SERVIÇOS
    if (resource === 'service') {
      if (action === 'delete') {
        StorageService.deleteService(id);
        return NextResponse.json({ success: true });
      }
      const service = StorageService.upsertService(data);
      return NextResponse.json({ success: true, service });
    }

    // 4. PLANOS
    if (resource === 'plan') {
      if (action === 'delete') {
        StorageService.deletePlan(id);
        return NextResponse.json({ success: true });
      }
      const plan = StorageService.upsertPlan(data);
      return NextResponse.json({ success: true, plan });
    }

    // 5. PORTFÓLIO
    if (resource === 'portfolio') {
      if (action === 'delete') {
        StorageService.deletePortfolioPost(id);
        return NextResponse.json({ success: true });
      }
      const post = StorageService.upsertPortfolioPost(data);
      return NextResponse.json({ success: true, post });
    }

    // 6. ESPAÇO DE TRABALHO
    if (resource === 'workspace') {
      if (action === 'delete') {
        StorageService.deleteWorkspacePhoto(id);
        return NextResponse.json({ success: true });
      }
      const photo = StorageService.upsertWorkspacePhoto(data);
      return NextResponse.json({ success: true, photo });
    }

    // 7. PROMOÇÕES
    if (resource === 'promotion') {
      if (action === 'delete') {
        StorageService.deletePromotion(id);
        return NextResponse.json({ success: true });
      }
      const promo = StorageService.upsertPromotion(data);
      return NextResponse.json({ success: true, promo });
    }

    // 8. PRODUTOS
    if (resource === 'product') {
      if (action === 'delete') {
        StorageService.deleteProduct(id);
        return NextResponse.json({ success: true });
      }
      const product = StorageService.upsertProduct(data);
      return NextResponse.json({ success: true, product });
    }

    // 9. CONFIGURAÇÕES
    if (resource === 'config') {
      const config = StorageService.updateSiteConfig(data);
      return NextResponse.json({ success: true, config });
    }

    return NextResponse.json({ error: 'Ação ou recurso inválido.' }, { status: 400 });
  } catch (error) {
    console.error('Erro na rota admin:', error);
    return NextResponse.json({ error: 'Erro ao processar operação no servidor.' }, { status: 500 });
  }
}
