'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  CreditCard, 
  Scissors, 
  Camera, 
  Heart, 
  Star, 
  Tag, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  Globe,
  Upload,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Gift
} from 'lucide-react';
import { 
  Client,
  Pet,
  PetSize,
  ServiceItem, 
  WorkspacePhoto, 
  PortfolioPost, 
  SubscriptionPlan, 
  PromotionItem, 
  ProductItem, 
  PRODUCT_CATEGORIES,
  PaymentLink, 
  SiteConfig,
  DashboardStats 
} from '@/lib/types';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils/formatters';
import PaginationControl from '@/components/ui/PaginationControl';
import { PaymentLinkModal } from '@/components/admin/PaymentLinkModal';
import { uploadImage, IMAGE_ACCEPT } from '@/lib/utils/image-upload';

type TabType = 
  | 'dashboard'
  | 'clients' 
  | 'charges' 
  | 'services' 
  | 'workspace' 
  | 'portfolio' 
  | 'plans' 
  | 'promotions' 
  | 'products' 
  | 'loyalty'
  | 'config';

const EMPTY_CONFIG: SiteConfig = {
  phone: '',
  instagram: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  businessHours: '',
  loyaltyCardImage: '/images/loyalty-card.jpg',
};

/** Estado vazio padronizado das listas (mesmo estilo de "Nenhum cliente cadastrado ainda."). */
function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full p-8 text-center text-xs font-medium text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
      {children}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Estados de Dados
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [photos, setPhotos] = useState<WorkspacePhoto[]>([]);
  const [posts, setPosts] = useState<PortfolioPost[]>([]);
  const [promos, setPromos] = useState<PromotionItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [charges, setCharges] = useState<PaymentLink[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Estados de Paginação para cada Aba
  const [pageClients, setPageClients] = useState(1);
  const [pageSizeClients, setPageSizeClients] = useState(10);

  const [pageCharges, setPageCharges] = useState(1);
  const [pageSizeCharges, setPageSizeCharges] = useState(6);

  const [pageServices, setPageServices] = useState(1);
  const [pageSizeServices, setPageSizeServices] = useState(6);

  const [pagePlans, setPagePlans] = useState(1);
  const [pageSizePlans, setPageSizePlans] = useState(6);

  const [pagePortfolio, setPagePortfolio] = useState(1);
  const [pageSizePortfolio, setPageSizePortfolio] = useState(6);

  const [pageWorkspace, setPageWorkspace] = useState(1);
  const [pageSizeWorkspace, setPageSizeWorkspace] = useState(6);

  const [pagePromos, setPagePromos] = useState(1);
  const [pageSizePromos, setPageSizePromos] = useState(6);

  const [pageProducts, setPageProducts] = useState(1);
  const [pageSizeProducts, setPageSizeProducts] = useState(8);

  // Modais Forms States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});

  const [showChargeModal, setShowChargeModal] = useState(false);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem>>({});

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan>>({ period: 'mensal', benefits: [''] });

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<PromotionItem>>({ isActive: true });

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<ProductItem>>({ isAvailable: true });

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<PortfolioPost>>({});

  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Partial<WorkspacePhoto>>({});

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), type === 'error' ? 7000 : 4000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Não foi possível carregar os dados do painel. Tente novamente.', 'error');
        setConfig(prev => prev ?? EMPTY_CONFIG);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setConfig(data.config);
      const sortedClients = (data.clients || []).sort((a: Client, b: Client) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
      );
      setClients(sortedClients);
      setServices(data.services || []);
      setPlans(data.plans || []);
      setPhotos(data.workspacePhotos || []);
      setPosts(data.portfolioPosts || []);
      setPromos(data.promotions || []);
      setProducts(data.products || []);
      setCharges(data.paymentLinks || []);
      setStats(data.stats);
    } catch (err) {
      showToast('Sem conexão com o servidor. Verifique sua internet e tente novamente.', 'error');
      setConfig(prev => prev ?? EMPTY_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // UPLOAD DE IMAGEM (converte HEIC, comprime e envia ao Supabase Storage)
  const [uploading, setUploading] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, folder = 'misc') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      callback(url);
      showToast('Imagem enviada!');
    } catch (err: any) {
      showToast(err?.message || 'Falha ao enviar imagem.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // HANDLER DE REORDENAÇÃO DE REGISTROS (SUBIR OU DESCER POSIÇÃO)
  const handleMoveItem = async (
    resource: 'service' | 'plan' | 'workspace' | 'portfolio' | 'promotion' | 'product',
    index: number,
    direction: 'up' | 'down'
  ) => {
    let list: any[] = [];
    let setList: (items: any[]) => void = () => {};

    if (resource === 'service') { list = [...services]; setList = setServices; }
    else if (resource === 'plan') { list = [...plans]; setList = setPlans; }
    else if (resource === 'workspace') { list = [...photos]; setList = setPhotos; }
    else if (resource === 'portfolio') { list = [...posts]; setList = setPosts; }
    else if (resource === 'promotion') { list = [...promos]; setList = setPromos; }
    else if (resource === 'product') { list = [...products]; setList = setProducts; }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setList(list);

    try {
      const ids = list.map(item => item.id);
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          resource,
          data: { ids },
        }),
      });
    } catch (err) {
      console.error('Erro ao reordenar registros:', err);
    }
  };

  // HANDLERS CRUD
  const send = async (payload: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return false;
      }
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(result.error || 'Não foi possível concluir a operação. Tente novamente.', 'error');
        return false;
      }
      return true;
    } catch {
      showToast('Sem conexão com o servidor. Verifique sua internet e tente novamente.', 'error');
      return false;
    }
  };

  const save = async (
    e: React.FormEvent,
    resource: string,
    data: unknown,
    doneMsg: string,
    close?: () => void
  ) => {
    e.preventDefault();
    setSaving(true);
    const ok = await send({ action: 'upsert', resource, data });
    setSaving(false);
    if (ok) {
      close?.();
      showToast(doneMsg);
      loadAdminData();
    }
  };

  const remove = async (resource: string, id: string, confirmMsg: string, doneMsg: string) => {
    if (!confirm(confirmMsg)) return;
    if (await send({ action: 'delete', resource, id })) {
      showToast(doneMsg);
      loadAdminData();
    }
  };

  const handleSaveClient = (e: React.FormEvent) =>
    save(e, 'client', editingClient, 'Cliente salvo e sincronizado com o Asaas!', () => setShowClientModal(false));
  const handleDeleteClient = (id: string) =>
    remove('client', id, 'Tem certeza que deseja excluir este cliente?', 'Cliente removido.');

  const handleDeleteCharge = (id: string) =>
    remove('paymentLink', id, 'Deseja excluir este link? A cobrança também será cancelada no Asaas.', 'Link removido.');

  const handleSaveService = (e: React.FormEvent) =>
    save(e, 'service', editingService, 'Serviço salvo!', () => setShowServiceModal(false));
  const handleDeleteService = (id: string) => remove('service', id, 'Excluir este serviço?', 'Serviço removido.');

  const handleSavePlan = (e: React.FormEvent) =>
    save(e, 'plan', editingPlan, 'Plano salvo!', () => setShowPlanModal(false));
  const handleDeletePlan = (id: string) => remove('plan', id, 'Excluir este plano?', 'Plano removido.');

  const handleSavePromo = (e: React.FormEvent) =>
    save(e, 'promotion', { ...editingPromo, isActive: true }, 'Promoção salva!', () => setShowPromoModal(false));
  const handleDeletePromo = (id: string) =>
    remove('promotion', id, 'Excluir esta promoção? Ela sumirá do site imediatamente.', 'Promoção excluída.');

  const handleSaveProduct = (e: React.FormEvent) =>
    save(e, 'product', editingProduct, 'Produto salvo!', () => setShowProductModal(false));
  const handleDeleteProduct = (id: string) => remove('product', id, 'Excluir este produto?', 'Produto excluído.');

  const handleSavePortfolio = (e: React.FormEvent) =>
    save(e, 'portfolio', editingPost, 'Publicação salva!', () => setShowPortfolioModal(false));
  const handleDeletePortfolio = (id: string) =>
    remove('portfolio', id, 'Excluir esta publicação?', 'Publicação removida.');

  const handleSaveWorkspace = (e: React.FormEvent) => {
    if (!editingPhoto.url) {
      e.preventDefault();
      showToast('Anexe uma imagem do seu computador.', 'error');
      return Promise.resolve();
    }
    return save(e, 'workspace', editingPhoto, 'Foto do espaço salva!', () => setShowWorkspaceModal(false));
  };
  const handleDeleteWorkspace = (id: string) =>
    remove('workspace', id, 'Excluir esta foto do espaço?', 'Foto removida.');

  const handleSaveConfig = (e: React.FormEvent) => {
    if (!config) {
      e.preventDefault();
      return Promise.resolve();
    }
    return save(e, 'config', config, 'Configurações salvas!');
  };

  const handleSaveLoyalty = (e: React.FormEvent) => {
    if (!config) {
      e.preventDefault();
      return Promise.resolve();
    }
    return save(e, 'config', config, 'Imagem do cartão fidelidade atualizada!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-brand-sky animate-spin" />
          <p className="text-sm font-bold tracking-wide">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div
          role={toastType === 'error' ? 'alert' : 'status'}
          className={`fixed top-5 right-5 z-[60] max-w-sm text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
            toastType === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toastType === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border border-brand-sky">
              <Image src="/images/logo-white-paws.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">LAV AU JATO</h2>
              <span className="text-[10px] font-bold text-brand-sky uppercase tracking-widest block">
                Painel do administrador
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'dashboard' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-brand-sky" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'clients' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Clientes ({clients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('charges')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'charges' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Links de pagamento ({charges.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'services' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scissors className="w-4 h-4 text-purple-400" />
              <span>Serviços ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('loyalty')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'loyalty' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Gift className="w-4 h-4 text-pink-400" />
              <span>Cartão fidelidade</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'plans' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Planos ({plans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'promotions' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Promoções ({promos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'workspace' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Fotos do espaço ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'portfolio' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Galeria ({posts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'products' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>Produtos da loja ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'config' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Configurações</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ir para o site
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Bem-vinda, Camilly! 👋</h1>
              <p className="text-sm text-slate-400 font-medium">
                Gerencie seus clientes, cobranças e todo o conteúdo do site
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-sky-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Clientes Cadastrados</span>
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block">{stats?.totalClients || 0}</span>
                <span className="text-[11px] text-slate-500">Sincronizados com Asaas</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Serviços Ativos</span>
                  <Scissors className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block">{stats?.activeServices || 0}</span>
                <span className="text-[11px] text-slate-500">Exibidos no site</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Planos Recorrentes</span>
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block">{stats?.activePlans || 0}</span>
                <span className="text-[11px] text-slate-500">Assinaturas ativas</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Links gerados</span>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block">{stats?.pendingChargesCount || 0}</span>
                <span className="text-[11px] text-slate-500">Total de links criados</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => { setShowClientModal(true); setEditingClient({}); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Novo Cliente
                </button>

                <button
                  onClick={() => setShowChargeModal(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  <CreditCard className="w-4 h-4" /> Gerar link de pagamento
                </button>

                <button
                  onClick={() => { setShowServiceModal(true); setEditingService({ isActive: true }); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  <Scissors className="w-4 h-4" /> Adicionar Serviço
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLIENTES */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Clientes cadastrados</h1>
              </div>
              <button
                onClick={() => {
                  setEditingClient({
                    name: '',
                    phone: '',
                    email: '',
                    pets: [{ id: `pet-${Date.now()}`, name: '', breed: '', size: 'Médio', notes: '' }]
                  });
                  setShowClientModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Cliente
              </button>
            </div>

            {/* Client Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Tutor</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Pets</th>
                    <th className="p-4">ID Asaas</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum cliente cadastrado ainda.</td>
                    </tr>
                  ) : (
                    clients
                      .slice((pageClients - 1) * pageSizeClients, pageClients * pageSizeClients)
                      .map((client) => (
                      <tr key={client.id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-bold text-white">
                          <div className="text-sm">{client.name}</div>
                          {client.address && (
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">📍 {client.address}</div>
                          )}
                          {client.notes && (
                            <div className="text-[10px] font-normal text-slate-500 italic mt-0.5">Obs: {client.notes}</div>
                          )}
                        </td>
                        <td className="p-4">{formatPhone(client.phone)}</td>
                        <td className="p-4">
                          {client.pets && client.pets.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {client.pets.map((p, idx) => (
                                <div key={p.id || idx} className="flex items-center gap-2.5 bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                                  {p.photoUrl ? (
                                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-amber-500/40 shrink-0">
                                      <Image src={p.photoUrl} alt={p.name} fill className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0 text-sm border border-slate-700">
                                      🐾
                                    </div>
                                  )}
                                  <div className="flex flex-col text-xs">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-amber-400">{p.name}</span>
                                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                        p.gender === 'Fêmea' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                      }`}>
                                        {p.gender === 'Fêmea' ? '♀ Fêmea' : '♂ Macho'}
                                      </span>
                                      {p.size && (
                                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                          {p.size}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                                      {p.breed && <span>Raça: {p.breed}</span>}
                                      {p.coatColor && <span>• Pelagem: {p.coatColor}</span>}
                                      {p.age && <span>• Idade: {p.age}</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-amber-400">{client.petName || 'Sem pet'}</span>
                              {client.petBreed && <span className="text-slate-400"> - {client.petBreed} ({client.petSize || 'Médio'})</span>}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[11px] bg-slate-800 text-sky-400 px-2.5 py-1 rounded-md border border-slate-700">
                            {client.asaasCustomerId || 'Sincronizando...'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              const clientPets: Pet[] = client.pets && client.pets.length > 0
                                ? client.pets
                                : client.petName
                                  ? [{ id: `pet-1`, name: client.petName, breed: client.petBreed || '', size: (client.petSize || 'Médio') as PetSize, notes: client.notes || '' }]
                                  : [{ id: `pet-${Date.now()}`, name: '', breed: '', size: 'Médio' as PetSize, notes: '' }];
                              
                              setEditingClient({
                                ...client,
                                pets: clientPets,
                              });
                              setShowClientModal(true);
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControl
              currentPage={pageClients}
              totalPages={Math.ceil(clients.length / pageSizeClients)}
              totalItems={clients.length}
              pageSize={pageSizeClients}
              onPageChange={setPageClients}
              onPageSizeChange={setPageSizeClients}
              pageSizeOptions={[5, 10, 15, 20]}
              itemLabel="clientes"
            />
          </div>
        )}

        {/* TAB 3: LINKS DE PAGAMENTO */}
        {activeTab === 'charges' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Links de pagamento</h1>
                <p className="text-xs text-slate-400 font-medium">
                  Ofereça pagamentos via PIX e cartão de crédito, à vista ou parcelado.
                </p>
              </div>
              <button
                onClick={() => setShowChargeModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Gerar link
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charges.length === 0 ? (
                <EmptyState>
                  Nenhum link gerado ainda. Clique em &quot;Gerar link&quot; para começar.
                </EmptyState>
              ) : (
                charges
                  .slice((pageCharges - 1) * pageSizeCharges, pageCharges * pageSizeCharges)
                  .map((link) => {
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/pagamento/${link.slug}` : '';
                    return (
                      <div key={link.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-slate-400 block uppercase">Cliente</span>
                            <h3 className="text-lg font-extrabold text-white">{link.customerName}</h3>
                          </div>
                          <span className="text-2xl font-black text-emerald-400 whitespace-nowrap">
                            {formatCurrency(link.value)}{link.chargeType === 'RECURRENT' && <span className="text-xs">/mês</span>}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{link.itemName}{link.petSize ? ` · porte ${link.petSize.toLowerCase()}` : ''}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                          <span className="bg-slate-800 text-sky-400 px-3 py-1 rounded-full uppercase">
                            {link.paymentMethod === 'BOTH' ? 'PIX ou cartão' : link.paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}
                            {link.paymentMethod !== 'PIX' && link.installmentCount > 1 ? ` · ${link.installmentCount}x` : ''}
                          </span>
                          <span className="bg-slate-800 text-amber-400 px-3 py-1 rounded-full uppercase">
                            {link.chargeType === 'SINGLE' ? 'Única' : 'Recorrente'}
                          </span>
                          <span className="text-slate-500 font-medium">{formatDate(link.createdAt)}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                          <button
                            onClick={() => { navigator.clipboard.writeText(url); showToast('Link copiado!'); }}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copiar link
                          </button>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 text-xs font-bold transition-all">
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir página de pagamento
                          </a>
                          <div className="flex justify-center gap-6 pt-1">
                            <button onClick={() => handleDeleteCharge(link.id)} className="text-xs text-rose-400 hover:underline font-semibold">Excluir link</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <PaginationControl
              currentPage={pageCharges}
              totalPages={Math.ceil(charges.length / pageSizeCharges)}
              totalItems={charges.length}
              pageSize={pageSizeCharges}
              onPageChange={setPageCharges}
              onPageSizeChange={setPageSizeCharges}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="links"
            />
          </div>
        )}

        {/* TAB 4: SERVIÇOS */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Serviços</h1>
                <p className="text-xs text-slate-400 font-medium">Mantenha atualizadas as informações dos serviços oferecidos.</p>
              </div>
              <button
                onClick={() => { setShowServiceModal(true); setEditingService({ isActive: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Serviço
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.length === 0 && <EmptyState>Nenhum serviço cadastrado ainda.</EmptyState>}
              {services
                .slice((pageServices - 1) * pageSizeServices, pageServices * pageSizeServices)
                .map((service, index) => {
                  const globalIndex = (pageServices - 1) * pageSizeServices + index;
                  return (
                    <div key={service.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{service.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                        </div>
                        <span className="text-lg font-extrabold text-emerald-400 shrink-0">
                          {service.price && service.price > 0 ? formatCurrency(service.price) : 'Sob consulta'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('service', globalIndex, 'up')}
                            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === services.length - 1}
                            onClick={() => handleMoveItem('service', globalIndex, 'down')}
                            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setEditingService(service); setShowServiceModal(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Editar serviço">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteService(service.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg" title="Excluir serviço">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pageServices}
              totalPages={Math.ceil(services.length / pageSizeServices)}
              totalItems={services.length}
              pageSize={pageSizeServices}
              onPageChange={setPageServices}
              onPageSizeChange={setPageSizeServices}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="serviços"
            />
          </div>
        )}

        {/* TAB 5: PLANOS */}
        {activeTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Planos recorrentes</h1>
                <p className="text-xs text-slate-400 font-medium">Defina os planos disponíveis para seus clientes no site.</p>
              </div>
              <button
                onClick={() => { setShowPlanModal(true); setEditingPlan({ period: 'mensal', benefits: [''] }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Plano
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.length === 0 && <EmptyState>Nenhum plano cadastrado ainda.</EmptyState>}
              {plans
                .slice((pagePlans - 1) * pageSizePlans, pagePlans * pageSizePlans)
                .map((plan, index) => {
                  const globalIndex = (pagePlans - 1) * pageSizePlans + index;
                  return (
                    <div key={plan.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                          <p className="text-xs text-slate-400">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          {plan.priceSmall || plan.priceMedium || plan.priceLarge ? (
                            <div className="flex flex-col text-xs text-amber-400 font-bold space-y-0.5">
                              <span>Pequeno: {plan.priceSmall ? formatCurrency(plan.priceSmall) : 'Sob consulta'}</span>
                              <span>Médio: {plan.priceMedium ? formatCurrency(plan.priceMedium) : 'Sob consulta'}</span>
                              <span>Grande: {plan.priceLarge ? formatCurrency(plan.priceLarge) : 'Sob consulta'}</span>
                            </div>
                          ) : (
                            <span className="text-xl font-black text-amber-400">
                              Sob consulta
                            </span>
                          )}
                        </div>
                      </div>

                      {plan.bonus && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          <span>Bônus: {plan.bonus}</span>
                        </div>
                      )}

                      <ul className="space-y-1 text-xs text-slate-300">
                        {plan.benefits.map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>

                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('plan', globalIndex, 'up')}
                            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === plans.length - 1}
                            onClick={() => handleMoveItem('plan', globalIndex, 'down')}
                            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-300" title="Editar plano">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg" title="Excluir plano">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pagePlans}
              totalPages={Math.ceil(plans.length / pageSizePlans)}
              totalItems={plans.length}
              pageSize={pageSizePlans}
              onPageChange={setPagePlans}
              onPageSizeChange={setPageSizePlans}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="planos"
            />
          </div>
        )}

        {/* TAB 6: GALERIA DE ATENDIMENTOS */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Galeria de atendimentos</h1>
                <p className="text-xs text-slate-400 font-medium">Publique fotos dos pets atendidos com informações sobre o atendimento.</p>
              </div>
              <button
                onClick={() => { setShowPortfolioModal(true); setEditingPost({ date: new Date().toISOString().split('T')[0] }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Publicar atendimento
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.length === 0 && <EmptyState>Nenhum atendimento publicado ainda.</EmptyState>}
              {posts
                .slice((pagePortfolio - 1) * pageSizePortfolio, pagePortfolio * pageSizePortfolio)
                .map((post, index) => {
                  const globalIndex = (pagePortfolio - 1) * pageSizePortfolio + index;
                  return (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-800">
                        <Image src={post.photoUrl || '/images/logo-white-paws.png'} alt={post.petName} fill className="object-cover" />
                      </div>
                      <h3 className="text-base font-bold text-white">{post.petName} <span className="text-xs text-slate-400 font-normal">({post.breed})</span></h3>
                      <p className="text-xs text-slate-300">{post.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('portfolio', globalIndex, 'up')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === posts.length - 1}
                            onClick={() => handleMoveItem('portfolio', globalIndex, 'down')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setEditingPost(post); setShowPortfolioModal(true); }} className="p-1.5 bg-slate-800 rounded text-slate-300 hover:text-white" title="Editar atendimento">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeletePortfolio(post.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded" title="Excluir atendimento">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pagePortfolio}
              totalPages={Math.ceil(posts.length / pageSizePortfolio)}
              totalItems={posts.length}
              pageSize={pageSizePortfolio}
              onPageChange={setPagePortfolio}
              onPageSizeChange={setPageSizePortfolio}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="atendimentos"
            />
          </div>
        )}

        {/* TAB 7: ESPAÇO DE TRABALHO */}
        {activeTab === 'workspace' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Fotos do espaço de trabalho</h1>
                <p className="text-xs text-slate-400 font-medium">Compartilhe fotos para mostrar seu espaço de trabalho aos clientes.</p>
              </div>
              <button
                onClick={() => { setShowWorkspaceModal(true); setEditingPhoto({ order: photos.length + 1 }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar foto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos.length === 0 && <EmptyState>Nenhuma foto cadastrada ainda.</EmptyState>}
              {photos
                .slice((pageWorkspace - 1) * pageSizeWorkspace, pageWorkspace * pageSizeWorkspace)
                .map((photo, index) => {
                  const globalIndex = (pageWorkspace - 1) * pageSizeWorkspace + index;
                  return (
                    <div key={photo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-800">
                        <Image src={photo.url} alt="Foto do espaço" fill className="object-cover" />
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('workspace', globalIndex, 'up')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === photos.length - 1}
                            onClick={() => handleMoveItem('workspace', globalIndex, 'down')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteWorkspace(photo.id)}
                          className="p-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"
                          title="Excluir foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pageWorkspace}
              totalPages={Math.ceil(photos.length / pageSizeWorkspace)}
              totalItems={photos.length}
              pageSize={pageSizeWorkspace}
              onPageChange={setPageWorkspace}
              onPageSizeChange={setPageSizeWorkspace}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="fotos"
            />
          </div>
        )}

        {/* TAB 8: PROMOÇÕES */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Promoções</h1>
                <p className="text-xs text-slate-400 font-medium">Cadastre e edite as promoções exibidas para seus clientes.</p>
              </div>
              <button
                onClick={() => { setShowPromoModal(true); setEditingPromo({ isActive: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Criar promoção
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.length === 0 && <EmptyState>Nenhuma promoção cadastrada ainda.</EmptyState>}
              {promos
                .slice((pagePromos - 1) * pageSizePromos, pagePromos * pageSizePromos)
                .map((promo, index) => {
                  const globalIndex = (pagePromos - 1) * pageSizePromos + index;
                  return (
                    <div key={promo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-white">{promo.title}</h3>
                        <span className="text-sm font-black text-amber-400">{promo.discountText}</span>
                      </div>
                      <p className="text-xs text-slate-300">{promo.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('promotion', globalIndex, 'up')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === promos.length - 1}
                            onClick={() => handleMoveItem('promotion', globalIndex, 'down')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setEditingPromo(promo); setShowPromoModal(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white" title="Editar promoção">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeletePromo(promo.id)} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg" title="Excluir promoção">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pagePromos}
              totalPages={Math.ceil(promos.length / pageSizePromos)}
              totalItems={promos.length}
              pageSize={pageSizePromos}
              onPageChange={setPagePromos}
              onPageSizeChange={setPageSizePromos}
              pageSizeOptions={[4, 6, 8, 10]}
              itemLabel="promoções"
            />
          </div>
        )}

        {/* TAB 9: PRODUTOS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Produtos da loja</h1>
                <p className="text-xs text-slate-400 font-medium">Gerencie os produtos disponíveis na loja.</p>
              </div>
              <button
                onClick={() => { setShowProductModal(true); setEditingProduct({ isAvailable: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Cadastrar produto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.length === 0 && <EmptyState>Nenhum produto cadastrado ainda.</EmptyState>}
              {products
                .slice((pageProducts - 1) * pageSizeProducts, pageProducts * pageSizeProducts)
                .map((prod, index) => {
                  const globalIndex = (pageProducts - 1) * pageSizeProducts + index;
                  return (
                    <div key={prod.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800">
                        <Image src={prod.photoUrl || '/images/logo-transparent.png'} alt={prod.name} fill className="object-contain p-2" />
                      </div>
                      <h3 className="text-sm font-bold text-white">{prod.name}</h3>
                      <span className="text-lg font-black text-teal-400 block">
                        {prod.price && prod.price > 0 ? formatCurrency(prod.price) : 'Sob consulta'}
                      </span>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                          <button
                            type="button"
                            disabled={globalIndex === 0}
                            onClick={() => handleMoveItem('product', globalIndex, 'up')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o início"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={globalIndex === products.length - 1}
                            onClick={() => handleMoveItem('product', globalIndex, 'down')}
                            className="p-1 text-slate-300 hover:text-white disabled:opacity-20 transition-colors"
                            title="Mover para o final"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => { setEditingProduct(prod); setShowProductModal(true); }} className="p-1.5 bg-slate-800 rounded text-slate-300 hover:text-white" title="Editar produto">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-rose-500/10 text-rose-400 rounded" title="Excluir produto">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <PaginationControl
              currentPage={pageProducts}
              totalPages={Math.ceil(products.length / pageSizeProducts)}
              totalItems={products.length}
              pageSize={pageSizeProducts}
              onPageChange={setPageProducts}
              onPageSizeChange={setPageSizeProducts}
              pageSizeOptions={[5, 10, 15, 20]}
              itemLabel="produtos"
            />
          </div>
        )}

        {/* TAB: CARTÃO FIDELIDADE */}
        {activeTab === 'loyalty' && config && (
          <form onSubmit={handleSaveLoyalty} className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Cartão fidelidade</h1>
              <p className="text-xs text-slate-400 font-medium">Altere a imagem do cartão exibida na página principal do site.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs font-bold text-slate-300">
              <div className="relative w-full aspect-[1024/585] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                {config.loyaltyCardImage && (
                  <Image src={config.loyaltyCardImage} alt="Cartão fidelidade" fill className="object-cover" unoptimized />
                )}
              </div>

              <div className="space-y-1">
                <label>Imagem</label>
                <div className="relative border border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-4 text-center bg-slate-800/60 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    onChange={(e) => handleFileUpload(e, (url) => setConfig({ ...config, loyaltyCardImage: url }), 'config')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-300">{uploading ? 'Enviando...' : '+ Selecionar nova imagem'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold tracking-wider text-xs shadow-lg transition-all disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 10: CONFIGURAÇÕES */}
        {activeTab === 'config' && config && (
          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Configurações gerais do site</h1>
              <p className="text-xs text-slate-400 font-medium">Altere dados de contato, endereço e horário de funcionamento.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs font-bold text-slate-300">
              
              <div className="space-y-1">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label>Link do Instagram</label>
                <input
                  type="text"
                  value={config.instagram}
                  onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label>Horário de funcionamento</label>
                <input
                  type="text"
                  value={config.businessHours || ''}
                  onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Bairro</label>
                  <input
                    type="text"
                    value={config.addressNeighborhood}
                    onChange={(e) => setConfig({ ...config, addressNeighborhood: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={config.addressCity}
                    onChange={(e) => setConfig({ ...config, addressCity: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold tracking-wider text-xs shadow-lg transition-all"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}

      </main>

      {/* MODAL FORM CLIENTE (Com suporte a múltiplos Pets) */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveClient} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 text-xs font-bold text-slate-300 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-white">{editingClient.id ? 'Editar cliente' : 'Cadastrar cliente'}</h3>
            
            <div className="space-y-1">
              <label>Nome do tutor *</label>
              <input type="text" required value={editingClient.name || ''} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Telefone / WhatsApp *</label>
                <input type="text" required value={editingClient.phone || ''} onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <label>E-mail</label>
                <input type="email" value={editingClient.email || ''} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label>CPF/CNPJ * <span className="text-slate-500 font-medium">(obrigatório para o Asaas)</span></label>
              <input type="text" required inputMode="numeric" value={editingClient.cpfCnpj || ''} onChange={(e) => setEditingClient({ ...editingClient, cpfCnpj: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Endereço do tutor *</label>
              <input type="text" required value={editingClient.address || ''} onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Observações</label>
              <textarea rows={2} value={editingClient.notes || ''} onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            {/* Pets do Tutor (1 para N) */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">🐾 Pets Cadastrados ({(editingClient.pets || []).length})</label>
                <button
                  type="button"
                  onClick={() => {
                    const currentPets = editingClient.pets || [];
                    setEditingClient({
                      ...editingClient,
                      pets: [...currentPets, { id: `pet-${Date.now()}-${Math.random()}`, name: '', breed: '', size: 'Médio', gender: 'Macho', age: '', coatColor: '', photoUrl: '', notes: '' }]
                    });
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                >
                  + Adicionar outro pet
                </button>
              </div>

              {(editingClient.pets || []).map((pet, pIdx) => (
                <div key={pet.id || pIdx} className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">PET #{pIdx + 1}</span>
                    {(editingClient.pets || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedPets = (editingClient.pets || []).filter((_, idx) => idx !== pIdx);
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                      >
                        Remover pet
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px]">Nome *</label>
                      <input
                        type="text"
                        required
                        value={pet.name || ''}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], name: e.target.value };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px]">Sexo *</label>
                      <select
                        value={pet.gender || 'Macho'}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], gender: e.target.value as any };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      >
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px]">Raça *</label>
                      <input
                        type="text"
                        required
                        value={pet.breed || ''}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], breed: e.target.value };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px]">Porte *</label>
                      <select
                        required
                        value={pet.size || 'Médio'}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], size: e.target.value as any };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      >
                        <option value="Pequeno">Pequeno</option>
                        <option value="Médio">Médio</option>
                        <option value="Grande">Grande</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px]">Cor da pelagem *</label>
                      <input
                        type="text"
                        required
                        value={pet.coatColor || ''}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], coatColor: e.target.value };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px]">Idade</label>
                      <input
                        type="text"
                        value={pet.age || ''}
                        onChange={(e) => {
                          const updatedPets = [...(editingClient.pets || [])];
                          updatedPets[pIdx] = { ...updatedPets[pIdx], age: e.target.value };
                          setEditingClient({ ...editingClient, pets: updatedPets });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Upload Foto do PET */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px]">Foto</label>
                    <div className="flex items-center gap-3">
                      {pet.photoUrl && (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-amber-500/50 shrink-0">
                          <Image src={pet.photoUrl} alt={pet.name || 'Pet'} fill className="object-cover" />
                        </div>
                      )}
                      <div className="relative flex-1 border border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-2 text-center bg-slate-900/60 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={(e) => handleFileUpload(e, (url) => {
                            const updatedPets = [...(editingClient.pets || [])];
                            updatedPets[pIdx] = { ...updatedPets[pIdx], photoUrl: url };
                            setEditingClient({ ...editingClient, pets: updatedPets });
                          })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-300">
                          {pet.photoUrl ? '✓ Alterar imagem' : '+ Selecionar imagem'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowClientModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-sky-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL LINK DE PAGAMENTO */}
      {showChargeModal && (
        <PaymentLinkModal
          services={services}
          plans={plans}
          onClose={() => setShowChargeModal(false)}
          onCreated={loadAdminData}
        />
      )}

      {/* MODAL FORM SERVIÇO (Com Anexo de Imagem) */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveService} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">{editingService.id ? 'Editar serviço' : 'Cadastrar serviço'}</h3>
            
            <div className="space-y-1">
              <label>Título *</label>
              <input type="text" required value={editingService.title || ''} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <textarea rows={3} required value={editingService.description || ''} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingService.price !== undefined && editingService.price !== null && !isNaN(editingService.price) ? editingService.price : ''} 
                  onChange={(e) => setEditingService({ ...editingService, price: e.target.value !== '' ? parseFloat(e.target.value) : undefined })} 
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" 
                />
              </div>
              <div className="space-y-1">
                <label>Duração estimada</label>
                <input type="text" value={editingService.duration || ''} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
            </div>

            {/* Upload Imagem do Serviço */}
            <div className="space-y-1">
              <label>Imagem</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingService.image ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-purple-500'
              }`}>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => handleFileUpload(e, (url) => setEditingService({ ...editingService, image: url }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  {editingService.image ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ Imagem anexada com sucesso!</span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Clique para selecionar outra imagem do seu dispositivo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-purple-400" />
                      <span className="text-xs font-bold text-slate-300">Clique aqui para selecionar uma foto do seu dispositivo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowServiceModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-purple-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM PLANO */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePlan} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">{editingPlan.id ? 'Editar plano' : 'Cadastrar plano'}</h3>
            
            <div className="space-y-1">
              <label>Nome *</label>
              <input type="text" required value={editingPlan.name || ''} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            {/* Valores por porte do PET */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Valores por porte do PET</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px]">Porte pequeno (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceSmall !== undefined && editingPlan.priceSmall !== null && !isNaN(editingPlan.priceSmall) ? editingPlan.priceSmall : ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceSmall: e.target.value !== '' ? parseFloat(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px]">Porte médio (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceMedium !== undefined && editingPlan.priceMedium !== null && !isNaN(editingPlan.priceMedium) ? editingPlan.priceMedium : ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceMedium: e.target.value !== '' ? parseFloat(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px]">Porte grande (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.priceLarge !== undefined && editingPlan.priceLarge !== null && !isNaN(editingPlan.priceLarge) ? editingPlan.priceLarge : ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceLarge: e.target.value !== '' ? parseFloat(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <input type="text" required value={editingPlan.description || ''} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Texto do botão *</label>
              <input type="text" required value={editingPlan.buttonText || ''} onChange={(e) => setEditingPlan({ ...editingPlan, buttonText: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Benefícios (um por linha) *</label>
              <textarea rows={7} required value={(editingPlan.benefits || []).join('\n')} onChange={(e) => setEditingPlan({ ...editingPlan, benefits: e.target.value.split('\n') })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            <div className="space-y-1">
              <label>Bônus</label>
              <input
                type="text"
                value={editingPlan.bonus || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, bonus: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" checked={editingPlan.isPopular || false} onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
              <label>Marcar como plano recomendado</label>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowPlanModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-amber-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM PROMOÇÃO */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePromo} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">{editingPromo.id ? 'Editar promoção' : 'Criar promoção'}</h3>
            
            <div className="space-y-1">
              <label>Título *</label>
              <input type="text" required value={editingPromo.title || ''} onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <input type="text" required value={editingPromo.description || ''} onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Texto do desconto *</label>
              <input type="text" required value={editingPromo.discountText || ''} onChange={(e) => setEditingPromo({ ...editingPromo, discountText: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowPromoModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-amber-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM PRODUTO (Com Anexo de Imagem e Edição) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">{editingProduct.id ? 'Editar produto' : 'Cadastrar produto'}</h3>
            
            <div className="space-y-1">
              <label>Nome do produto *</label>
              <input type="text" required value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingProduct.price !== undefined && editingProduct.price !== null && !isNaN(editingProduct.price) ? editingProduct.price : ''} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value !== '' ? parseFloat(e.target.value) : undefined })} 
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" 
                />
              </div>
              <div className="space-y-1">
                <label>Categoria *</label>
                <select 
                  required
                  value={editingProduct.category || 'Acessórios'} 
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <textarea rows={2} required value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            {/* Upload Imagem do Produto */}
            <div className="space-y-1">
              <label>Imagem</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingProduct.photoUrl ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-teal-500'
              }`}>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => handleFileUpload(e, (url) => setEditingProduct({ ...editingProduct, photoUrl: url }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  {editingProduct.photoUrl ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ Imagem anexada com sucesso!</span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Clique para selecionar outra imagem do seu dispositivo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-teal-400" />
                      <span className="text-xs font-bold text-slate-300">Clique aqui para selecionar uma foto do seu dispositivo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowProductModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-teal-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM PORTFÓLIO (Com Anexo de Imagem e Edição) */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSavePortfolio} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">{editingPost.id ? 'Editar atendimento' : 'Publicar atendimento'}</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Nome do pet *</label>
                <input type="text" required value={editingPost.petName || ''} onChange={(e) => setEditingPost({ ...editingPost, petName: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <label>Raça *</label>
                <input type="text" required value={editingPost.breed || ''} onChange={(e) => setEditingPost({ ...editingPost, breed: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Serviço realizado *</label>
                <input type="text" required value={editingPost.serviceDone || ''} onChange={(e) => setEditingPost({ ...editingPost, serviceDone: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <label>Data do atendimento *</label>
                <input type="date" required value={editingPost.date || new Date().toISOString().split('T')[0]} onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
              </div>
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <textarea rows={2} required value={editingPost.description || ''} onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            {/* Upload Imagem do Pet */}
            <div className="space-y-1">
              <label>Imagem</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingPost.photoUrl ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-rose-500'
              }`}>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => handleFileUpload(e, (url) => setEditingPost({ ...editingPost, photoUrl: url }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  {editingPost.photoUrl ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ Imagem anexada com sucesso!</span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Clique para selecionar outra imagem do seu dispositivo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-rose-400" />
                      <span className="text-xs font-bold text-slate-300">Clique aqui para selecionar uma foto do seu dispositivo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowPortfolioModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-extrabold">Publicar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM ESPAÇO */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveWorkspace} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">Adicionar foto do espaço</h3>

            {/* Upload por anexo do dispositivo */}
            <div className="space-y-1">
              <label>Foto *</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingPhoto.url ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-indigo-500'
              }`}>
                <input
                  type="file"
                  accept={IMAGE_ACCEPT}
                  onChange={(e) => handleFileUpload(e, (url) => setEditingPhoto({ ...editingPhoto, url }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  {editingPhoto.url ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ Imagem anexada com sucesso!</span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Clique para selecionar outra imagem do seu dispositivo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-300">Clique aqui para selecionar uma foto do seu dispositivo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowWorkspaceModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-indigo-600 text-white font-extrabold">Salvar</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
