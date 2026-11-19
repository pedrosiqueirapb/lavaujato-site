import 'server-only';
import crypto from 'crypto';
import {
  Client,
  Pet,
  ServiceItem,
  WorkspacePhoto,
  PortfolioPost,
  SubscriptionPlan,
  PromotionItem,
  ProductItem,
  PaymentLink,
  SiteConfig,
} from '@/lib/types';
import { encryptPII, decryptPII } from '@/lib/security/pii-crypto';
import { getSupabase, IMAGE_BUCKET } from '@/lib/db/supabase';
import { UserError, GENERIC_ERROR } from '@/lib/utils/errors';

/** Aceita só http(s). Sem esquema, assume https://. Bloqueia javascript:, data: etc. */
function safeHttpUrl(v?: string | null): string {
  const raw = (v || '').trim();
  if (!raw) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

const db = () => getSupabase();

function check<T>(res: { data: T | null; error: any }): T {
  if (res.error) {
    console.error('[Supabase]', res.error);
    throw new UserError(GENERIC_ERROR);
  }
  return res.data as T;
}

const num = (v: any): number | undefined => (v === null || v === undefined || v === '' ? undefined : Number(v));
const orNull = (v: any) => (v === undefined || v === '' ? null : v);
const isUuid = (v?: string) => !!v && /^[0-9a-f-]{36}$/i.test(v);

const DEFAULT_LOYALTY_IMAGE = '/images/loyalty-card.jpg';

// ------------------------- MAPEADORES -------------------------
const mapConfig = (r: any): SiteConfig => ({
  phone: r?.phone || '',
  instagram: safeHttpUrl(r?.instagram) || '',
  addressNeighborhood: r?.address_neighborhood || '',
  addressCity: r?.address_city || '',
  addressState: r?.address_state || '',
  businessHours: r?.business_hours || '',
  loyaltyCardImage: r?.loyalty_card_image || DEFAULT_LOYALTY_IMAGE,
  updatedAt: r?.updated_at,
});

const mapPet = (r: any): Pet => ({
  id: r.id,
  name: r.name,
  gender: r.gender || undefined,
  breed: r.breed || undefined,
  size: r.size || undefined,
  coatColor: r.coat_color || undefined,
  age: r.age || undefined,
  photoUrl: r.photo_url || undefined,
  notes: r.notes || undefined,
});

const mapClient = (r: any): Client => ({
  id: r.id,
  name: decryptPII(r.name),
  phone: decryptPII(r.phone),
  email: r.email ? decryptPII(r.email) : undefined,
  cpfCnpj: r.cpf_cnpj ? decryptPII(r.cpf_cnpj) : undefined,
  address: decryptPII(r.address),
  notes: r.notes || '',
  asaasCustomerId: r.asaas_customer_id || undefined,
  pets: (r.pets || []).map(mapPet),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapService = (r: any): ServiceItem => ({
  id: r.id,
  title: r.title,
  description: r.description,
  image: r.image || '',
  price: num(r.price),
  duration: r.duration || undefined,
  badge: r.badge || undefined,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapPlan = (r: any): SubscriptionPlan => ({
  id: r.id,
  name: r.name,
  description: r.description,
  benefits: r.benefits || [],
  bonus: r.bonus || undefined,
  priceSmall: num(r.price_small),
  priceMedium: num(r.price_medium),
  priceLarge: num(r.price_large),
  isPopular: r.is_popular,
  buttonText: r.button_text || undefined,
  period: 'mensal',
  createdAt: r.created_at,
});

const mapPromo = (r: any): PromotionItem => ({
  id: r.id,
  title: r.title,
  description: r.description,
  discountText: r.discount_text,
  badge: r.badge || undefined,
  validUntil: r.valid_until || undefined,
  image: r.image || undefined,
  isActive: r.is_active,
  createdAt: r.created_at,
});

const mapProduct = (r: any): ProductItem => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: num(r.price),
  category: r.category || undefined,
  photoUrl: r.photo_url || '',
  isAvailable: r.is_available,
  createdAt: r.created_at,
});

const mapPost = (r: any): PortfolioPost => ({
  id: r.id,
  petName: r.pet_name,
  breed: r.breed || undefined,
  serviceDone: r.service_done,
  description: r.description,
  photoUrl: r.photo_url || '',
  date: r.date || '',
  createdAt: r.created_at,
});

const mapPhoto = (r: any): WorkspacePhoto => ({
  id: r.id,
  url: r.url,
  title: '',
  order: r.sort_order,
  createdAt: r.created_at,
});

const mapLink = (r: any): PaymentLink => ({
  id: r.id,
  slug: r.slug,
  asaasCustomerId: r.asaas_customer_id,
  customerName: r.customer_name,
  description: r.description || undefined,
  itemType: r.item_type,
  itemId: r.item_id || undefined,
  itemName: r.item_name,
  petSize: r.pet_size || undefined,
  value: Number(r.value),
  chargeType: r.charge_type,
  paymentMethod: r.payment_method,
  installmentCount: r.installment_count,
  asaasPaymentId: r.asaas_payment_id || undefined,
  asaasSubscriptionId: r.asaas_subscription_id || undefined,
  cardUrl: r.card_url || undefined,
  pixPayload: r.pix_payload || undefined,
  status: r.status,
  createdAt: r.created_at,
});

async function nextOrder(table: string): Promise<number> {
  const { data } = await db().from(table).select('sort_order').order('sort_order', { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}

async function upsertRow(table: string, id: string | undefined, row: Record<string, any>) {
  if (isUuid(id)) {
    return check(await db().from(table).update(row).eq('id', id!).select().single());
  }
  const sort_order = await nextOrder(table);
  return check(await db().from(table).insert({ ...row, sort_order }).select().single());
}

async function deleteRow(table: string, id: string) {
  check(await db().from(table).delete().eq('id', id));
  return true;
}

// ------------------------- SERVIÇO -------------------------
export class StorageService {
  // CONFIGURAÇÕES
  static async getSiteConfig(): Promise<SiteConfig> {
    const r = check(await db().from('site_config').select('*').eq('id', 'default').maybeSingle());
    return mapConfig(r);
  }

  /** Versão segura para páginas públicas (falha silenciosa para não derrubar o site). */
  static async getPublicSiteConfig(): Promise<SiteConfig> {
    try {
      return await this.getSiteConfig();
    } catch {
      return mapConfig(null);
    }
  }

  static async updateSiteConfig(update: Partial<SiteConfig>): Promise<SiteConfig> {
    // Mescla com o que já está salvo, para que salvar uma tela não apague os campos de outra.
    const u = { ...(await this.getSiteConfig()), ...update };
    const row = {
      id: 'default',
      phone: u.phone ?? '',
      instagram: (() => {
        const raw = (u.instagram ?? '').trim();
        if (!raw) return '';
        const ok = safeHttpUrl(raw);
        if (!ok) throw new UserError('O link do Instagram deve começar com https://');
        return ok;
      })(),
      address_neighborhood: u.addressNeighborhood ?? '',
      address_city: u.addressCity ?? '',
      address_state: u.addressState ?? '',
      business_hours: u.businessHours ?? '',
      loyalty_card_image: u.loyaltyCardImage && u.loyaltyCardImage !== DEFAULT_LOYALTY_IMAGE ? u.loyaltyCardImage : null,
      updated_at: new Date().toISOString(),
    };
    return mapConfig(check(await db().from('site_config').upsert(row).select().single()));
  }

  // CLIENTES
  static async getClients(): Promise<Client[]> {
    const rows = check(await db().from('clients').select('*, pets(*)').eq('is_deleted', false));
    return (rows as any[]).map(mapClient).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }

  static async upsertClient(c: Partial<Client> & { name: string; phone: string }): Promise<Client> {
    const row = {
      name: encryptPII(c.name),
      phone: encryptPII(c.phone),
      email: c.email ? encryptPII(c.email) : null,
      cpf_cnpj: c.cpfCnpj ? encryptPII(c.cpfCnpj) : null,
      address: encryptPII(c.address || ''),
      notes: orNull(c.notes),
      asaas_customer_id: orNull(c.asaasCustomerId),
      updated_at: new Date().toISOString(),
    };
    const saved: any = isUuid(c.id)
      ? check(await db().from('clients').update(row).eq('id', c.id!).select().single())
      : check(await db().from('clients').insert(row).select().single());

    // Substitui os pets do cliente
    check(await db().from('pets').delete().eq('client_id', saved.id));
    const pets = (c.pets || []).filter(p => p.name?.trim());
    if (pets.length) {
      check(
        await db().from('pets').insert(
          pets.map(p => ({
            client_id: saved.id,
            name: p.name,
            gender: orNull(p.gender),
            breed: orNull(p.breed),
            size: orNull(p.size),
            coat_color: orNull(p.coatColor),
            age: orNull(p.age),
            photo_url: orNull(p.photoUrl),
            notes: orNull(p.notes),
          }))
        )
      );
    }
    const full = check(await db().from('clients').select('*, pets(*)').eq('id', saved.id).single());
    return mapClient(full);
  }

  static async getClientAsaasId(id: string): Promise<string | null> {
    if (!isUuid(id)) return null;
    const r: any = check(await db().from('clients').select('asaas_customer_id').eq('id', id).maybeSingle());
    return r?.asaas_customer_id || null;
  }

  static async deleteClient(id: string) {
    check(await db().from('clients').update({ is_deleted: true, updated_at: new Date().toISOString() }).eq('id', id));
    return true;
  }

  // SERVIÇOS
  static async getServices(activeOnly = false): Promise<ServiceItem[]> {
    let q = db().from('services').select('*').order('sort_order');
    if (activeOnly) q = q.eq('is_active', true);
    return (check(await q) as any[]).map(mapService);
  }

  static async upsertService(s: Partial<ServiceItem>): Promise<ServiceItem> {
    return mapService(
      await upsertRow('services', s.id, {
        title: s.title,
        description: s.description || '',
        image: orNull(s.image),
        price: num(s.price) ?? null,
        duration: orNull(s.duration),
        badge: orNull(s.badge),
        is_active: s.isActive ?? true,
        updated_at: new Date().toISOString(),
      })
    );
  }
  static deleteService = (id: string) => deleteRow('services', id);

  // PLANOS
  static async getPlans(): Promise<SubscriptionPlan[]> {
    return (check(await db().from('plans').select('*').order('sort_order')) as any[]).map(mapPlan);
  }

  static async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    const r = check(await db().from('plans').select('*').eq('id', id).maybeSingle());
    return r ? mapPlan(r) : null;
  }

  static async getServiceById(id: string): Promise<ServiceItem | null> {
    const r = check(await db().from('services').select('*').eq('id', id).maybeSingle());
    return r ? mapService(r) : null;
  }

  static async upsertPlan(p: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    return mapPlan(
      await upsertRow('plans', p.id, {
        name: p.name,
        description: p.description || '',
        benefits: (p.benefits || []).filter(b => b && b.trim()),
        bonus: orNull(p.bonus),
        price_small: num(p.priceSmall) ?? null,
        price_medium: num(p.priceMedium) ?? null,
        price_large: num(p.priceLarge) ?? null,
        is_popular: !!p.isPopular,
        button_text: orNull(p.buttonText),
      })
    );
  }
  static deletePlan = (id: string) => deleteRow('plans', id);

  // GALERIA
  static async getPortfolioPosts(): Promise<PortfolioPost[]> {
    return (check(await db().from('portfolio_posts').select('*').order('sort_order')) as any[]).map(mapPost);
  }
  static async upsertPortfolioPost(p: Partial<PortfolioPost>): Promise<PortfolioPost> {
    return mapPost(
      await upsertRow('portfolio_posts', p.id, {
        pet_name: p.petName,
        breed: orNull(p.breed),
        service_done: p.serviceDone || '',
        description: p.description || '',
        photo_url: orNull(p.photoUrl),
        date: orNull(p.date),
      })
    );
  }
  static deletePortfolioPost = (id: string) => deleteRow('portfolio_posts', id);

  // FOTOS DO ESPAÇO
  static async getWorkspacePhotos(): Promise<WorkspacePhoto[]> {
    return (check(await db().from('workspace_photos').select('*').order('sort_order')) as any[]).map(mapPhoto);
  }
  static async upsertWorkspacePhoto(p: Partial<WorkspacePhoto>): Promise<WorkspacePhoto> {
    return mapPhoto(await upsertRow('workspace_photos', p.id, { url: p.url }));
  }
  static deleteWorkspacePhoto = (id: string) => deleteRow('workspace_photos', id);

  // PROMOÇÕES
  static async getPromotions(activeOnly = false): Promise<PromotionItem[]> {
    let q = db().from('promotions').select('*').order('sort_order');
    if (activeOnly) q = q.eq('is_active', true);
    return (check(await q) as any[]).map(mapPromo);
  }
  static async upsertPromotion(p: Partial<PromotionItem>): Promise<PromotionItem> {
    return mapPromo(
      await upsertRow('promotions', p.id, {
        title: p.title,
        description: p.description || '',
        discount_text: p.discountText || '',
        badge: orNull(p.badge),
        valid_until: orNull(p.validUntil),
        image: orNull(p.image),
        is_active: p.isActive ?? true,
      })
    );
  }
  static deletePromotion = (id: string) => deleteRow('promotions', id);

  // PRODUTOS
  static async getProducts(availableOnly = false): Promise<ProductItem[]> {
    let q = db().from('products').select('*').order('sort_order');
    if (availableOnly) q = q.eq('is_available', true);
    return (check(await q) as any[]).map(mapProduct);
  }
  static async upsertProduct(p: Partial<ProductItem>): Promise<ProductItem> {
    return mapProduct(
      await upsertRow('products', p.id, {
        name: p.name,
        description: p.description || '',
        price: num(p.price) ?? null,
        category: orNull(p.category),
        photo_url: orNull(p.photoUrl),
        is_available: p.isAvailable ?? true,
      })
    );
  }
  static deleteProduct = (id: string) => deleteRow('products', id);

  // LINKS DE PAGAMENTO
  static async getPaymentLinks(): Promise<PaymentLink[]> {
    const rows = check(await db().from('payment_links').select('*').neq('status', 'CANCELLED').order('created_at', { ascending: false }));
    return (rows as any[]).map(mapLink);
  }

  static async getPaymentLinkBySlug(slug: string): Promise<PaymentLink | null> {
    const r = check(await db().from('payment_links').select('*').eq('slug', slug).maybeSingle());
    return r ? mapLink(r) : null;
  }

  static async addPaymentLink(l: Omit<PaymentLink, 'id' | 'createdAt' | 'status' | 'slug'>): Promise<PaymentLink> {
    const slug = crypto.randomBytes(12).toString('base64url');
    const row = {
      slug,
      asaas_customer_id: l.asaasCustomerId,
      customer_name: l.customerName,
      description: orNull(l.description),
      item_type: l.itemType,
      item_id: orNull(l.itemId),
      item_name: l.itemName,
      pet_size: orNull(l.petSize),
      value: l.value,
      charge_type: l.chargeType,
      payment_method: l.paymentMethod,
      installment_count: l.installmentCount,
      asaas_payment_id: orNull(l.asaasPaymentId),
      asaas_subscription_id: orNull(l.asaasSubscriptionId),
      card_url: orNull(l.cardUrl),
      pix_payload: orNull(l.pixPayload),
    };
    return mapLink(check(await db().from('payment_links').insert(row).select().single()));
  }

  static async updatePaymentLinkStatus(id: string, status: PaymentLink['status']) {
    check(await db().from('payment_links').update({ status }).eq('id', id));
    return true;
  }

  // REORDENAÇÃO
  static async reorderItems(resource: string, ids: string[]): Promise<boolean> {
    const tables: Record<string, string> = {
      service: 'services',
      plan: 'plans',
      portfolio: 'portfolio_posts',
      workspace: 'workspace_photos',
      promotion: 'promotions',
      product: 'products',
    };
    const table = tables[resource];
    if (!table) return false;
    await Promise.all(ids.map((id, idx) => db().from(table).update({ sort_order: idx + 1 }).eq('id', id)));
    return true;
  }

  // UPLOAD DE IMAGENS (Supabase Storage)
  static async uploadImage(buffer: Buffer, contentType: string, folder: string): Promise<string> {
    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const path = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const { error } = await db().storage.from(IMAGE_BUCKET).upload(path, buffer, { contentType, upsert: false });
    if (error) {
      console.error('[Supabase Storage]', error);
      throw new UserError('Não foi possível enviar a imagem. Tente novamente em instantes.');
    }
    return db().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
  }
}
