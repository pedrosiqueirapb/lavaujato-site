import 'server-only';
import { AsaasCustomerSummary } from '@/lib/types';

function config() {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada no .env');
  const sandbox = process.env.ASAAS_IS_SANDBOX === 'true';
  const baseUrl = sandbox ? 'https://api-sandbox.asaas.com/v3' : 'https://api.asaas.com/v3';
  return { apiKey, baseUrl };
}

async function asaas<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiKey, baseUrl } = config();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'LavAuJato',
      access_token: apiKey,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.errors?.map((e: any) => e.description).join(' ') || res.statusText;
    throw new Error(`Asaas: ${msg}`);
  }
  return body as T;
}

const digits = (v?: string) => (v || '').replace(/\D/g, '');
const dueDate = (days = 3) => new Date(Date.now() + days * 864e5).toISOString().split('T')[0];

export class AsaasService {
  /** Cria ou atualiza o cliente no Asaas. Exige nome + CPF/CNPJ. */
  static async upsertCustomer(c: {
    asaasCustomerId?: string;
    name: string;
    cpfCnpj: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Promise<string> {
    const phone = digits(c.phone).replace(/^55(?=\d{10,11}$)/, '');
    const payload: Record<string, any> = {
      name: c.name,
      cpfCnpj: digits(c.cpfCnpj),
      mobilePhone: phone || undefined,
      email: c.email || undefined,
      address: c.address || undefined,
      notificationDisabled: true,
    };
    if (c.asaasCustomerId) {
      const r = await asaas(`/customers/${c.asaasCustomerId}`, { method: 'PUT', body: JSON.stringify(payload) });
      return r.id;
    }
    const r = await asaas('/customers', { method: 'POST', body: JSON.stringify(payload) });
    return r.id;
  }

  static async listCustomers(): Promise<AsaasCustomerSummary[]> {
    const all: AsaasCustomerSummary[] = [];
    let offset = 0;
    for (let page = 0; page < 20; page++) {
      const r = await asaas<{ data: any[]; hasMore: boolean }>(`/customers?limit=100&offset=${offset}`);
      all.push(...r.data.filter(c => !c.deleted).map(c => ({ id: c.id, name: c.name, cpfCnpj: c.cpfCnpj, email: c.email })));
      if (!r.hasMore) break;
      offset += 100;
    }
    return all.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  /** Cobrança única no cartão (número de parcelas definido pela usuária). */
  static async createCardPayment(p: { customer: string; value: number; description: string; installmentCount: number }) {
    const payload: Record<string, any> = {
      customer: p.customer,
      billingType: 'CREDIT_CARD',
      dueDate: dueDate(),
      description: p.description,
    };
    if (p.installmentCount > 1) {
      payload.installmentCount = p.installmentCount;
      payload.totalValue = p.value;
    } else {
      payload.value = p.value;
    }
    const r = await asaas('/payments', { method: 'POST', body: JSON.stringify(payload) });
    return { id: r.id as string, invoiceUrl: r.invoiceUrl as string };
  }

  /** Assinatura mensal no cartão. Retorna a fatura da 1ª mensalidade (onde o cliente cadastra o cartão). */
  static async createSubscription(p: { customer: string; value: number; description: string }) {
    const sub = await asaas('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: p.customer,
        billingType: 'CREDIT_CARD',
        cycle: 'MONTHLY',
        value: p.value,
        nextDueDate: dueDate(1),
        description: p.description,
      }),
    });
    const payments = await asaas<{ data: any[] }>(`/subscriptions/${sub.id}/payments`);
    const first = payments.data?.[0];
    return { id: sub.id as string, invoiceUrl: (first?.invoiceUrl as string) || '' };
  }

  static async cancel(link: { asaasPaymentId?: string; asaasSubscriptionId?: string }) {
    try {
      if (link.asaasSubscriptionId) await asaas(`/subscriptions/${link.asaasSubscriptionId}`, { method: 'DELETE' });
      if (link.asaasPaymentId) await asaas(`/payments/${link.asaasPaymentId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Não foi possível cancelar no Asaas:', e);
    }
  }
}
