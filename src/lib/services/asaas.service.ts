import { StorageService } from './storage.service';
import { AsaasCharge, BillingType, ChargeCycle } from '@/lib/types';

export class AsaasService {
  private static getApiConfig() {
    const config = StorageService.getSiteConfig();
    const isSandbox = config.isSandbox ?? true;
    const apiKey = config.asaasApiKey || process.env.ASAAS_API_KEY || '';
    const baseUrl = isSandbox 
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3';

    return { apiKey, baseUrl, isSandbox };
  }

  /**
   * Extrai o ID limpo de URLs recebidas do Asaas (/c/id ou /i/id)
   */
  static extractAsaasId(urlOrId: string): string {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();
    if (trimmed.includes('/c/')) {
      return trimmed.split('/c/')[1]?.split('?')[0] || trimmed;
    }
    if (trimmed.includes('/i/')) {
      return trimmed.split('/i/')[1]?.split('?')[0] || trimmed;
    }
    if (trimmed.includes('/payments/')) {
      return trimmed.split('/payments/')[1]?.split('?')[0] || trimmed;
    }
    return trimmed;
  }

  /**
   * Cadastra ou atualiza um cliente na API do Asaas
   */
  static async syncCustomer(client: { name: string; phone: string; email?: string; cpfCnpj?: string }): Promise<string> {
    const { apiKey, baseUrl } = this.getApiConfig();

    if (!apiKey) {
      console.warn('[Asaas Sandbox Mode] Chave de API não configurada. Gerando ID simulado.');
      return `cus_demo_${Date.now()}`;
    }

    try {
      const response = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': apiKey,
        },
        body: JSON.stringify({
          name: client.name,
          mobilePhone: client.phone.replace(/\D/g, ''),
          email: client.email || undefined,
          cpfCnpj: client.cpfCnpj ? client.cpfCnpj.replace(/\D/g, '') : undefined,
          notificationDisabled: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao sincronizar cliente no Asaas:', errorData);
        return `cus_fallback_${Date.now()}`;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Falha na requisição para o Asaas:', error);
      return `cus_offline_${Date.now()}`;
    }
  }

  /**
   * Gera um Link de Cobrança / Pagamento no Asaas
   */
  static async createCharge(params: {
    customerId: string;
    customerName: string;
    value: number;
    description: string;
    billingType: BillingType;
    cycle: ChargeCycle;
    installmentCount?: number;
  }): Promise<AsaasCharge> {
    const { apiKey, baseUrl } = this.getApiConfig();
    const now = new Date().toISOString();

    if (!apiKey) {
      // Mock Resiliente em modo Sandbox sem chave configurada
      const mockId = `pay_demo_${Date.now()}`;
      const mockInvoice = `https://sandbox.asaas.com/i/demo_${Date.now()}`;
      const mockCharge: AsaasCharge = {
        id: mockId,
        customerId: params.customerId,
        customerName: params.customerName,
        value: params.value,
        description: params.description,
        billingType: params.billingType,
        cycle: params.cycle,
        installmentCount: params.installmentCount,
        invoiceUrl: mockInvoice,
        pixCopiaECola: params.billingType === 'PIX' ? '00020126580014br.gov.bcb.pix0136lava-au-jato-pix-demo-code5204000053039865405199.005802BR' : undefined,
        status: 'PENDING',
        createdAt: now,
      };
      StorageService.addCharge(mockCharge);
      return mockCharge;
    }

    try {
      let endpoint = `${baseUrl}/payments`;
      const payload: any = {
        customer: params.customerId,
        billingType: params.billingType,
        value: params.value,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias úteis
        description: params.description,
      };

      if (params.installmentCount && params.installmentCount > 1) {
        payload.installmentCount = params.installmentCount;
        payload.installmentValue = Number((params.value / params.installmentCount).toFixed(2));
      }

      if (params.cycle !== 'SINGLE') {
        endpoint = `${baseUrl}/subscriptions`;
        payload.cycle = params.cycle;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Asaas API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const charge: AsaasCharge = {
        id: data.id,
        customerId: params.customerId,
        customerName: params.customerName,
        value: params.value,
        description: params.description,
        billingType: params.billingType,
        cycle: params.cycle,
        installmentCount: params.installmentCount,
        invoiceUrl: data.invoiceUrl || data.bankSlipUrl,
        pixCopiaECola: data.pixQrCode || undefined,
        status: 'PENDING',
        createdAt: now,
      };

      StorageService.addCharge(charge);
      return charge;
    } catch (error) {
      console.error('Erro ao gerar cobrança no Asaas:', error);
      // Fallback gracioso
      const fallbackCharge: AsaasCharge = {
        id: `pay_fallback_${Date.now()}`,
        customerId: params.customerId,
        customerName: params.customerName,
        value: params.value,
        description: params.description,
        billingType: params.billingType,
        cycle: params.cycle,
        invoiceUrl: `https://wa.me/553173335033?text=Olá%20Camilly,%20gostaria%20de%20pagar%20R$${params.value}`,
        status: 'PENDING',
        createdAt: now,
      };
      StorageService.addCharge(fallbackCharge);
      return fallbackCharge;
    }
  }
}
