export type PetSize = 'Pequeno' | 'Médio' | 'Grande';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpfCnpj?: string;
  address?: string;
  petName: string;
  petBreed?: string;
  petSize?: PetSize;
  notes?: string;
  asaasCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: number;
  duration?: string;
  badge?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspacePhoto {
  id: string;
  url: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
}

export interface PortfolioPost {
  id: string;
  petName: string;
  breed?: string;
  serviceDone: string;
  description: string;
  photoUrl: string;
  date: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'semanal' | 'quinzenal' | 'mensal' | 'anual' | string;
  description: string;
  benefits: string[];
  isPopular?: boolean;
  buttonText?: string;
  createdAt: string;
}

export interface PromotionItem {
  id: string;
  title: string;
  description: string;
  discountText: string;
  validUntil?: string;
  badge?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  photoUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

export type BillingType = 'CREDIT_CARD' | 'PIX' | 'BOLETO';
export type ChargeCycle = 'SINGLE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface AsaasCharge {
  id: string;
  customerId: string;
  customerName: string;
  value: number;
  description: string;
  billingType: BillingType;
  cycle: ChargeCycle;
  installmentCount?: number;
  invoiceUrl?: string;
  pixCopiaECola?: string;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'DELETED';
  createdAt: string;
}

export interface SiteConfig {
  phone: string;
  instagram: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  isSandbox: boolean;
  asaasApiKey: string;
  is2FAEnabled: boolean;
  admin2FASecret?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalClients: number;
  activeServices: number;
  activePlans: number;
  activePromos: number;
  totalProducts: number;
  pendingChargesCount: number;
}
