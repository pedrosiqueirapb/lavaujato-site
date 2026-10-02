import fs from 'fs';
import path from 'path';
import { 
  Client, 
  ServiceItem, 
  WorkspacePhoto, 
  PortfolioPost, 
  SubscriptionPlan, 
  PromotionItem, 
  ProductItem, 
  AsaasCharge, 
  SiteConfig 
} from '@/lib/types';
import { 
  initialSiteConfig, 
  initialServices, 
  initialPlans, 
  initialWorkspacePhotos, 
  initialPortfolioPosts, 
  initialPromotions, 
  initialProducts, 
  initialClients, 
  initialCharges 
} from './initial-data';
import { encryptPII, decryptPII } from '@/lib/security/pii-crypto';

interface StorageSchema {
  siteConfig: SiteConfig;
  services: ServiceItem[];
  plans: SubscriptionPlan[];
  workspacePhotos: WorkspacePhoto[];
  portfolioPosts: PortfolioPost[];
  promotions: PromotionItem[];
  products: ProductItem[];
  clients: Client[];
  charges: AsaasCharge[];
  deletedChargeIds: string[];
}

// Global memory cache para resiliência entre invocações Node.js
declare global {
  var __LAVA_AU_JATO_STORE__: StorageSchema | undefined;
}

const STORAGE_FILE_PATH = path.join(process.cwd(), '.data-store.json');

function getInitialStore(): StorageSchema {
  return {
    siteConfig: { ...initialSiteConfig },
    services: [...initialServices],
    plans: [...initialPlans],
    workspacePhotos: [...initialWorkspacePhotos],
    portfolioPosts: [...initialPortfolioPosts],
    promotions: [...initialPromotions],
    products: [...initialProducts],
    clients: [...initialClients],
    charges: [...initialCharges],
    deletedChargeIds: [],
  };
}

function loadStore(): StorageSchema {
  if (globalThis.__LAVA_AU_JATO_STORE__) {
    return globalThis.__LAVA_AU_JATO_STORE__;
  }

  try {
    if (fs.existsSync(STORAGE_FILE_PATH)) {
      const fileData = fs.readFileSync(STORAGE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData) as StorageSchema;
      globalThis.__LAVA_AU_JATO_STORE__ = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Fallback para memória nativa (arquivo .data-store.json inacessível):', err);
  }

  const initial = getInitialStore();
  globalThis.__LAVA_AU_JATO_STORE__ = initial;
  saveStore(initial);
  return initial;
}

function saveStore(store: StorageSchema): void {
  globalThis.__LAVA_AU_JATO_STORE__ = store;
  try {
    fs.writeFileSync(STORAGE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Erro ao salvar em arquivo de cache local:', err);
  }
}

export class StorageService {
  // CONFIGS
  static getSiteConfig(): SiteConfig {
    const store = loadStore();
    return store.siteConfig;
  }

  static updateSiteConfig(updates: Partial<SiteConfig>): SiteConfig {
    const store = loadStore();
    store.siteConfig = {
      ...store.siteConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.siteConfig;
  }

  // CLIENTES (Com Criptografia PII & Soft Delete)
  static getClients(): Client[] {
    const store = loadStore();
    return store.clients
      .filter(c => !c.isDeleted)
      .map(c => ({
        ...c,
        name: decryptPII(c.name),
        phone: decryptPII(c.phone),
        email: decryptPII(c.email),
        address: decryptPII(c.address),
      }));
  }

  static getClientById(id: string): Client | null {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  static upsertClient(clientData: Partial<Client> & { name: string; phone: string; petName: string }): Client {
    const store = loadStore();
    const now = new Date().toISOString();
    const id = clientData.id || `cli-${Date.now()}`;

    // Criptografar PII antes de gravar
    const encryptedClient: Client = {
      id,
      name: encryptPII(clientData.name),
      phone: encryptPII(clientData.phone),
      email: clientData.email ? encryptPII(clientData.email) : undefined,
      cpfCnpj: clientData.cpfCnpj ? encryptPII(clientData.cpfCnpj) : undefined,
      address: clientData.address ? encryptPII(clientData.address) : undefined,
      petName: clientData.petName,
      petBreed: clientData.petBreed || '',
      petSize: clientData.petSize || 'Médio',
      notes: clientData.notes || '',
      asaasCustomerId: clientData.asaasCustomerId || '',
      createdAt: clientData.createdAt || now,
      updatedAt: now,
      isDeleted: false,
    };

    const index = store.clients.findIndex(c => c.id === id);
    if (index >= 0) {
      store.clients[index] = { ...store.clients[index], ...encryptedClient };
    } else {
      store.clients.unshift(encryptedClient);
    }

    saveStore(store);

    // Retorna a versão descriptografada
    return {
      ...encryptedClient,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      address: clientData.address,
    };
  }

  static deleteClient(id: string): boolean {
    const store = loadStore();
    const index = store.clients.findIndex(c => c.id === id);
    if (index >= 0) {
      store.clients[index].isDeleted = true;
      store.clients[index].updatedAt = new Date().toISOString();
      saveStore(store);
      return true;
    }
    return false;
  }

  // SERVIÇOS
  static getServices(): ServiceItem[] {
    const store = loadStore();
    return store.services;
  }

  static upsertService(service: Omit<ServiceItem, 'createdAt' | 'updatedAt'> & { id?: string }): ServiceItem {
    const store = loadStore();
    const now = new Date().toISOString();
    const id = service.id || `srv-${Date.now()}`;
    const newService: ServiceItem = {
      ...service,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const index = store.services.findIndex(s => s.id === id);
    if (index >= 0) {
      store.services[index] = newService;
    } else {
      store.services.push(newService);
    }
    saveStore(store);
    return newService;
  }

  static deleteService(id: string): boolean {
    const store = loadStore();
    store.services = store.services.filter(s => s.id !== id);
    saveStore(store);
    return true;
  }

  // PLANOS
  static getPlans(): SubscriptionPlan[] {
    const store = loadStore();
    return store.plans;
  }

  static upsertPlan(plan: Omit<SubscriptionPlan, 'createdAt'> & { id?: string }): SubscriptionPlan {
    const store = loadStore();
    const id = plan.id || `plan-${Date.now()}`;
    const newPlan: SubscriptionPlan = {
      ...plan,
      id,
      createdAt: new Date().toISOString(),
    };

    const index = store.plans.findIndex(p => p.id === id);
    if (index >= 0) {
      store.plans[index] = newPlan;
    } else {
      store.plans.push(newPlan);
    }
    saveStore(store);
    return newPlan;
  }

  static deletePlan(id: string): boolean {
    const store = loadStore();
    store.plans = store.plans.filter(p => p.id !== id);
    saveStore(store);
    return true;
  }

  // PORTFÓLIO
  static getPortfolioPosts(): PortfolioPost[] {
    const store = loadStore();
    return store.portfolioPosts;
  }

  static upsertPortfolioPost(post: Omit<PortfolioPost, 'createdAt'> & { id?: string }): PortfolioPost {
    const store = loadStore();
    const id = post.id || `port-${Date.now()}`;
    const newPost: PortfolioPost = {
      ...post,
      id,
      createdAt: new Date().toISOString(),
    };

    const index = store.portfolioPosts.findIndex(p => p.id === id);
    if (index >= 0) {
      store.portfolioPosts[index] = newPost;
    } else {
      store.portfolioPosts.unshift(newPost);
    }
    saveStore(store);
    return newPost;
  }

  static deletePortfolioPost(id: string): boolean {
    const store = loadStore();
    store.portfolioPosts = store.portfolioPosts.filter(p => p.id !== id);
    saveStore(store);
    return true;
  }

  // FOTOS DO ESPAÇO
  static getWorkspacePhotos(): WorkspacePhoto[] {
    const store = loadStore();
    return store.workspacePhotos.sort((a, b) => a.order - b.order);
  }

  static upsertWorkspacePhoto(photo: Omit<WorkspacePhoto, 'createdAt'> & { id?: string }): WorkspacePhoto {
    const store = loadStore();
    const id = photo.id || `ws-${Date.now()}`;
    const newPhoto: WorkspacePhoto = {
      ...photo,
      id,
      createdAt: new Date().toISOString(),
    };

    const index = store.workspacePhotos.findIndex(p => p.id === id);
    if (index >= 0) {
      store.workspacePhotos[index] = newPhoto;
    } else {
      store.workspacePhotos.push(newPhoto);
    }
    saveStore(store);
    return newPhoto;
  }

  static deleteWorkspacePhoto(id: string): boolean {
    const store = loadStore();
    store.workspacePhotos = store.workspacePhotos.filter(p => p.id !== id);
    saveStore(store);
    return true;
  }

  // PROMOÇÕES
  static getPromotions(activeOnly: boolean = false): PromotionItem[] {
    const store = loadStore();
    if (activeOnly) {
      return store.promotions.filter(p => p.isActive);
    }
    return store.promotions;
  }

  static upsertPromotion(promo: Omit<PromotionItem, 'createdAt'> & { id?: string }): PromotionItem {
    const store = loadStore();
    const id = promo.id || `promo-${Date.now()}`;
    const newPromo: PromotionItem = {
      ...promo,
      id,
      createdAt: new Date().toISOString(),
    };

    const index = store.promotions.findIndex(p => p.id === id);
    if (index >= 0) {
      store.promotions[index] = newPromo;
    } else {
      store.promotions.unshift(newPromo);
    }
    saveStore(store);
    return newPromo;
  }

  static deletePromotion(id: string): boolean {
    const store = loadStore();
    store.promotions = store.promotions.filter(p => p.id !== id);
    saveStore(store);
    return true;
  }

  // PRODUTOS
  static getProducts(availableOnly: boolean = false): ProductItem[] {
    const store = loadStore();
    if (availableOnly) {
      return store.products.filter(p => p.isAvailable);
    }
    return store.products;
  }

  static upsertProduct(prod: Omit<ProductItem, 'createdAt'> & { id?: string }): ProductItem {
    const store = loadStore();
    const id = prod.id || `prod-${Date.now()}`;
    const newProd: ProductItem = {
      ...prod,
      id,
      createdAt: new Date().toISOString(),
    };

    const index = store.products.findIndex(p => p.id === id);
    if (index >= 0) {
      store.products[index] = newProd;
    } else {
      store.products.unshift(newProd);
    }
    saveStore(store);
    return newProd;
  }

  static deleteProduct(id: string): boolean {
    const store = loadStore();
    store.products = store.products.filter(p => p.id !== id);
    saveStore(store);
    return true;
  }

  // COBRANÇAS ASAAS (Filtro de Deletados / Soft Delete conforme Pilar 3 & 4)
  static getCharges(): AsaasCharge[] {
    const store = loadStore();
    return store.charges.filter(c => c.status !== 'DELETED' && !store.deletedChargeIds.includes(c.id));
  }

  static addCharge(charge: AsaasCharge): AsaasCharge {
    const store = loadStore();
    store.charges.unshift(charge);
    saveStore(store);
    return charge;
  }

  static markChargeDeleted(id: string): void {
    const store = loadStore();
    if (!store.deletedChargeIds.includes(id)) {
      store.deletedChargeIds.push(id);
    }
    const index = store.charges.findIndex(c => c.id === id);
    if (index >= 0) {
      store.charges[index].status = 'DELETED';
    }
    saveStore(store);
  }
}
