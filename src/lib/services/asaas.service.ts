import 'server-only';
import { AsaasCustomerSummary } from '@/lib/types';
import { UserError, ASAAS_UNAVAILABLE } from '@/lib/utils/errors';

function config() {
  // Remove aspas, espaços e a barra de escape (\\$) que costuma ser colada junto com a chave
  const apiKey = (process.env.ASAAS_API_KEY || '').trim().replace(/^["']|["']$/g, '').replace(/^\\+/, '');
  if (!apiKey) {
    console.error('[Asaas] ASAAS_API_KEY ausente nas variáveis de ambiente.');
    throw new UserError(ASAAS_UNAVAILABLE);
  }
  const sandbox = process.env.ASAAS_IS_SANDBOX === 'true';
  const baseUrl = sandbox ? 'https://api-sandbox.asaas.com/v3' : 'https://api.asaas.com/v3';
  return { apiKey, baseUrl };
}

async function asaas<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiKey, baseUrl } = config();
  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LavAuJato',
        access_token: apiKey,
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[Asaas] Falha de rede:', err);
    throw new UserError(ASAAS_UNAVAILABLE);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`[Asaas] ${init.method || 'GET'} ${path} -> ${res.status}`, JSON.stringify(body));
    const msg: string | undefined = body?.errors?.map((e: any) => e.description).filter(Boolean).join(' ');
    // 401/403 = chave inválida/sem permissão: detalhe técnico, não exibir.
    if (res.status === 401 || res.status === 403 || !msg) throw new UserError(ASAAS_UNAVAILABLE);
    throw new UserError(msg);
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

  /** Link de pagamento do Asaas (aparece em "Links de pagamento" no Asaas), aceita SOMENTE cartão de crédito. */
  static async createPaymentLink(p: {
    name: string; value: number; description: string; recurrent: boolean; installmentCount: number;
  }) {
    const payload: Record<string, any> = {
      name: p.name.slice(0, 100),
      description: p.description,
      billingType: 'CREDIT_CARD',
      chargeType: p.recurrent ? 'RECURRENT' : p.installmentCount > 1 ? 'INSTALLMENT' : 'DETACHED',
      value: p.value,
      dueDateLimitDays: 10,
      notificationEnabled: false,
    };
    if (p.recurrent) payload.subscriptionCycle = 'MONTHLY';
    if (!p.recurrent && p.installmentCount > 1) payload.maxInstallmentCount = p.installmentCount;
    const r = await asaas('/paymentLinks', { method: 'POST', body: JSON.stringify(payload) });
    return { id: r.id as string, url: r.url as string };
  }

  static async cancel(link: { asaasPaymentId?: string; asaasSubscriptionId?: string }) {
    try {
      if (link.asaasSubscriptionId) await asaas(`/subscriptions/${link.asaasSubscriptionId}`, { method: 'DELETE' });
      if (link.asaasPaymentId) {
        try {
          await asaas(`/paymentLinks/${link.asaasPaymentId}`, { method: 'DELETE' });
        } catch {
          await asaas(`/payments/${link.asaasPaymentId}`, { method: 'DELETE' });
        }
      }
    } catch (e) {
      console.error('[Asaas] Não foi possível cancelar:', e);
    }
  }
}
