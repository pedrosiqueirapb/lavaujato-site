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
  ArrowDown
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
  AsaasCharge, 
  SiteConfig,
  DashboardStats 
} from '@/lib/types';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils/formatters';
import PaginationControl from '@/components/ui/PaginationControl';

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
  | 'config';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados de Dados
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [photos, setPhotos] = useState<WorkspacePhoto[]>([]);
  const [posts, setPosts] = useState<PortfolioPost[]>([]);
  const [promos, setPromos] = useState<PromotionItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [charges, setCharges] = useState<AsaasCharge[]>([]);
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
  const [newCharge, setNewCharge] = useState({
    customerId: '',
    customerName: '',
    value: '',
    description: '',
    billingType: 'CREDIT_CARD' as const,
    cycle: 'MONTHLY' as const,
    installmentCount: '1',
  });

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
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
        showToast('Erro ao carregar dados do painel.');
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
      setCharges(data.charges || []);
      setStats(data.stats);
    } catch (err) {
      showToast('Erro ao carregar dados do painel.');
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

  // UPLOAD DE FOTO DO COMPUTADOR (Base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          resource: 'client',
          data: editingClient,
        }),
      });
      if (res.ok) {
        showToast('Cliente salvo!');
        setShowClientModal(false);
        loadAdminData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'client', id }),
    });
    showToast('Cliente removido.');
    loadAdminData();
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedClient = clients.find(c => c.id === newCharge.customerId);
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          resource: 'charge',
          data: {
            ...newCharge,
            customerName: selectedClient?.name || newCharge.customerName || 'Cliente Pet',
          },
        }),
      });
      if (res.ok) {
        showToast('Cobrança Asaas gerada!');
        setShowChargeModal(false);
        loadAdminData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCharge = async (id: string) => {
    if (!confirm('Deseja excluir esta cobrança?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'charge', id }),
    });
    showToast('Cobrança removida.');
    loadAdminData();
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'service', data: editingService }),
    });
    setSaving(false);
    setShowServiceModal(false);
    showToast('Serviço salvo!');
    loadAdminData();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Excluir este serviço?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'service', id }),
    });
    showToast('Serviço removido.');
    loadAdminData();
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'plan', data: editingPlan }),
    });
    setSaving(false);
    setShowPlanModal(false);
    showToast('Plano salvo!');
    loadAdminData();
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Excluir este plano?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'plan', id }),
    });
    showToast('Plano removido.');
    loadAdminData();
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert',
        resource: 'promotion',
        data: { ...editingPromo, isActive: true },
      }),
    });
    setSaving(false);
    setShowPromoModal(false);
    showToast('Promoção salva!');
    loadAdminData();
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Excluir esta promoção? Ela sumirá do site imediatamente.')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'promotion', id }),
    });
    showToast('Promoção excluída.');
    loadAdminData();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'product', data: editingProduct }),
    });
    setSaving(false);
    setShowProductModal(false);
    showToast('Produto salvo!');
    loadAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'product', id }),
    });
    showToast('Produto excluído.');
    loadAdminData();
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'portfolio', data: editingPost }),
    });
    setSaving(false);
    setShowPortfolioModal(false);
    showToast('Publicação salva!');
    loadAdminData();
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Excluir esta publicação?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'portfolio', id }),
    });
    showToast('Publicação removida.');
    loadAdminData();
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto.url) {
      alert('Por favor, anexe uma imagem do seu computador.');
      return;
    }
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'workspace', data: editingPhoto }),
    });
    setSaving(false);
    setShowWorkspaceModal(false);
    showToast('Foto do espaço salva!');
    loadAdminData();
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm('Excluir esta foto do espaço?')) return;
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', resource: 'workspace', id }),
    });
    showToast('Foto removida.');
    loadAdminData();
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', resource: 'config', data: config }),
    });
    setSaving(false);
    showToast('Configurações salvas!');
    loadAdminData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-brand-sky animate-spin" />
          <p className="text-sm font-bold tracking-wide">Carregando Admin Painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5" />
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
              <span>Cobranças Asaas ({charges.length})</span>
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
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'plans' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Planos ({plans.length})</span>
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
              onClick={() => setActiveTab('workspace')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'workspace' ? 'bg-brand-navy text-white shadow-md border border-brand-sky/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Fotos do espaço ({photos.length})</span>
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
                Gerencie seus clientes, cobranças e todo o conteúdo do site Lav Au Jato.
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
                  <span className="text-xs font-bold uppercase tracking-wider">Cobranças Pendentes</span>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-3xl font-extrabold text-white block">{stats?.pendingChargesCount || 0}</span>
                <span className="text-[11px] text-slate-500">Links ativos no Asaas</span>
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
                  onClick={() => { setShowChargeModal(true); setNewCharge({ customerId: '', customerName: '', value: '', description: '', billingType: 'CREDIT_CARD', cycle: 'MONTHLY', installmentCount: '1' }); }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
                >
                  <CreditCard className="w-4 h-4" /> Gerar Cobrança Asaas
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
                    <th className="p-4">Pets (Nome / Raça / Porte)</th>
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
                        <td className="p-4 font-bold text-white">{client.name}</td>
                        <td className="p-4">{formatPhone(client.phone)}</td>
                        <td className="p-4">
                          {client.pets && client.pets.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                              {client.pets.map((p, idx) => (
                                <div key={p.id || idx} className="inline-flex items-center gap-1.5 text-xs">
                                  <span className="font-bold text-amber-400">🐾 {p.name}</span>
                                  <span className="text-slate-400">
                                    {p.breed ? `(${p.breed}` : ''}{p.size ? ` - ${p.size})` : p.breed ? ')' : ''}
                                  </span>
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
              pageSizeOptions={[5, 10, 20, 50]}
              itemLabel="clientes"
            />
          </div>
        )}

        {/* TAB 3: COBRANÇAS ASAAS */}
        {activeTab === 'charges' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Gerador de cobranças Asaas</h1>
                <p className="text-xs text-slate-400 font-medium">
                  Cartão de crédito recorrente, parcelado e pagamentos via PIX.
                </p>
              </div>
              <button
                onClick={() => { setShowChargeModal(true); setNewCharge({ customerId: '', customerName: '', value: '', description: '', billingType: 'CREDIT_CARD', cycle: 'MONTHLY', installmentCount: '1' }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Gerar Nova Cobrança
              </button>
            </div>

            {/* Charges List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charges.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                  Nenhuma cobrança gerada ainda. Clique em "Gerar Nova Cobrança" para começar.
                </div>
              ) : (
                charges
                  .slice((pageCharges - 1) * pageSizeCharges, pageCharges * pageSizeCharges)
                  .map((charge) => (
                  <div key={charge.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase">Cliente</span>
                        <h3 className="text-lg font-extrabold text-white">{charge.customerName}</h3>
                      </div>
                      <span className="text-2xl font-black text-emerald-400">{formatCurrency(charge.value)}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{charge.description}</p>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="bg-slate-800 text-sky-400 px-3 py-1 rounded-full uppercase">
                        {charge.billingType === 'CREDIT_CARD' ? '💳 Cartão de Crédito' : charge.billingType === 'PIX' ? '⚡ PIX' : '📄 Boleto'}
                      </span>
                      <span className="bg-slate-800 text-amber-400 px-3 py-1 rounded-full uppercase">
                        {charge.cycle === 'SINGLE' ? 'Única' : 'Recorrente'}
                      </span>
                    </div>

                    {/* Invoice Link & Copy WhatsApp */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                      {charge.invoiceUrl && (
                        <a
                          href={charge.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 text-xs font-bold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Link de pagamento Asaas
                        </a>
                      )}

                      {charge.pixCopiaECola && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(charge.pixCopiaECola || '');
                            showToast('Código PIX Copiado!');
                          }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copiar Código PIX Copia-e-Cola
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCharge(charge.id)}
                        className="text-xs text-rose-400 hover:underline pt-1 text-center font-semibold"
                      >
                        Excluir cobrança
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <PaginationControl
              currentPage={pageCharges}
              totalPages={Math.ceil(charges.length / pageSizeCharges)}
              totalItems={charges.length}
              pageSize={pageSizeCharges}
              onPageChange={setPageCharges}
              onPageSizeChange={setPageSizeCharges}
              pageSizeOptions={[6, 12, 24, 48]}
              itemLabel="cobranças"
            />
          </div>
        )}

        {/* TAB 4: SERVIÇOS */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Serviços prestados</h1>
                <p className="text-xs text-slate-400 font-medium">Adicione e edite os serviços visíveis no site.</p>
              </div>
              <button
                onClick={() => { setShowServiceModal(true); setEditingService({ isActive: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Serviço
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              pageSizeOptions={[6, 12, 24, 48]}
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
                <p className="text-xs text-slate-400 font-medium">Configure os planos oferecidos aos clientes no site.</p>
              </div>
              <button
                onClick={() => { setShowPlanModal(true); setEditingPlan({ period: 'mensal', benefits: [''] }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Plano
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <span className="text-2xl font-black text-amber-400">
                          {plan.price && plan.price > 0 ? formatCurrency(plan.price) : 'Sob consulta'}
                        </span>
                      </div>

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
              pageSizeOptions={[6, 12, 24, 48]}
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
                <p className="text-xs text-slate-400 font-medium">Poste e edite fotos dos pets atendidos com nome, data e serviço feito.</p>
              </div>
              <button
                onClick={() => { setShowPortfolioModal(true); setEditingPost({ date: new Date().toISOString().split('T')[0] }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Publicar atendimento de pet
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              pageSizeOptions={[6, 12, 24, 48]}
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
                <p className="text-xs text-slate-400 font-medium">Adicione, edite e remova imagens da seção "Nosso espaço".</p>
              </div>
              <button
                onClick={() => { setShowWorkspaceModal(true); setEditingPhoto({ order: photos.length + 1 }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar foto do espaço
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos
                .slice((pageWorkspace - 1) * pageSizeWorkspace, pageWorkspace * pageSizeWorkspace)
                .map((photo, index) => {
                  const globalIndex = (pageWorkspace - 1) * pageSizeWorkspace + index;
                  return (
                    <div key={photo.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-800">
                        <Image src={photo.url} alt={photo.title} fill className="object-cover" />
                      </div>
                      <h3 className="text-sm font-bold text-white">{photo.title}</h3>
                      <p className="text-xs text-slate-400">{photo.description}</p>
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

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingPhoto(photo); setShowWorkspaceModal(true); }}
                            className="p-1.5 bg-slate-800 rounded text-slate-300 hover:text-white"
                            title="Editar foto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkspace(photo.id)}
                            className="p-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              pageSizeOptions={[6, 12, 24, 48]}
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
                <p className="text-xs text-slate-400 font-medium">Ao excluir uma promoção, a seção sumirá automaticamente do site.</p>
              </div>
              <button
                onClick={() => { setShowPromoModal(true); setEditingPromo({ isActive: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Criar promoção
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              pageSizeOptions={[6, 12, 24, 48]}
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
                <p className="text-xs text-slate-400 font-medium">Cadastre e edite produtos para exibição no catálogo público.</p>
              </div>
              <button
                onClick={() => { setShowProductModal(true); setEditingProduct({ isAvailable: true }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> Cadastrar produto
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              pageSizeOptions={[8, 16, 32, 64]}
              itemLabel="produtos"
            />
          </div>
        )}

        {/* TAB 10: CONFIGURAÇÕES */}
        {activeTab === 'config' && config && (
          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-2xl animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Configurações gerais do site</h1>
              <p className="text-xs text-slate-400 font-medium">Altere dados de contato, endereço e chave do Asaas.</p>
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
            <h3 className="text-lg font-extrabold text-white">Cadastrar ou editar cliente</h3>
            
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
                      pets: [...currentPets, { id: `pet-${Date.now()}-${Math.random()}`, name: '', breed: '', size: 'Médio', notes: '' }]
                    });
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                >
                  + Adicionar outro pet
                </button>
              </div>

              {(editingClient.pets || []).map((pet, pIdx) => (
                <div key={pet.id || pIdx} className="bg-slate-800/60 border border-slate-700/80 p-3.5 rounded-2xl space-y-2 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-slate-400">PET #{pIdx + 1}</span>
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px]">Nome do pet *</label>
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
                      <label className="text-[10px]">Raça</label>
                      <input
                        type="text"
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
                      <label className="text-[10px]">Porte</label>
                      <select
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

      {/* MODAL COBRANÇA ASAAS */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCharge} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">Gerar cobrança no Asaas</h3>
            
            <div className="space-y-1">
              <label>Selecione o cliente *</label>
              <select required value={newCharge.customerId} onChange={(e) => setNewCharge({ ...newCharge, customerId: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium">
                <option value="">-- Escolha o Cliente --</option>
                {clients.map(c => {
                  const petSummary = c.pets && c.pets.length > 0
                    ? c.pets.map(p => p.name).join(', ')
                    : c.petName || 'Sem pet';
                  return (
                    <option key={c.id} value={c.id}>{c.name} (Pet(s): {petSummary})</option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Valor (R$) *</label>
                <input type="number" step="0.01" required value={newCharge.value} onChange={(e) => setNewCharge({ ...newCharge, value: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold" />
              </div>
              <div className="space-y-1">
                <label>Forma de pagamento *</label>
                <select value={newCharge.billingType} onChange={(e) => setNewCharge({ ...newCharge, billingType: e.target.value as any })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium">
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                  <option value="PIX">PIX (QrCode / Copia e Cola)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label>Tipo de recorrência *</label>
              <select value={newCharge.cycle} onChange={(e) => setNewCharge({ ...newCharge, cycle: e.target.value as any })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium">
                <option value="MONTHLY">Assinatura mensal recorrente</option>
                <option value="SINGLE">Cobrança única</option>
              </select>
            </div>

            <div className="space-y-1">
              <label>Descrição para a fatura</label>
              <input type="text" value={newCharge.description} onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowChargeModal(false)} className="w-1/2 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancelar</button>
              <button type="submit" disabled={saving} className="w-1/2 py-3 rounded-xl bg-emerald-600 text-white font-extrabold uppercase">Gerar link Asaas</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL FORM SERVIÇO (Com Anexo de Imagem) */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveService} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 text-xs font-bold text-slate-300">
            <h3 className="text-lg font-extrabold text-white">Cadastrar ou editar serviço</h3>
            
            <div className="space-y-1">
              <label>Título do serviço *</label>
              <input type="text" required value={editingService.title || ''} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Descrição *</label>
              <textarea rows={3} required value={editingService.description || ''} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Valor (R$) (Opcional)</label>
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
              <label>Anexar imagem do serviço</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingService.image ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-purple-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
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
            <h3 className="text-lg font-extrabold text-white">Cadastrar ou editar plano</h3>
            
            <div className="space-y-1">
              <label>Nome do plano *</label>
              <input type="text" required value={editingPlan.name || ''} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Valor mensal (R$) (Opcional)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingPlan.price !== undefined && editingPlan.price !== null && !isNaN(editingPlan.price) ? editingPlan.price : ''} 
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value !== '' ? parseFloat(e.target.value) : undefined })} 
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" 
                />
              </div>
              <div className="space-y-1">
                <label>Período *</label>
                <select 
                  value={editingPlan.period || 'mensal'} 
                  onChange={(e) => setEditingPlan({ ...editingPlan, period: e.target.value })} 
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                >
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label>Descrição do plano *</label>
              <input type="text" required value={editingPlan.description || ''} onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Texto do botão *</label>
              <input type="text" required value={editingPlan.buttonText || ''} onChange={(e) => setEditingPlan({ ...editingPlan, buttonText: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="space-y-1">
              <label>Benefícios (um por linha) *</label>
              <textarea rows={4} required value={(editingPlan.benefits || []).join('\n')} onChange={(e) => setEditingPlan({ ...editingPlan, benefits: e.target.value.split('\n') })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
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
            <h3 className="text-lg font-extrabold text-white">Criar ou editar promoção</h3>
            
            <div className="space-y-1">
              <label>Título da promoção *</label>
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
            <h3 className="text-lg font-extrabold text-white">Cadastrar ou editar produto</h3>
            
            <div className="space-y-1">
              <label>Nome do produto *</label>
              <input type="text" required value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label>Preço (R$) (Opcional)</label>
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
              <label>Anexar imagem do produto</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingProduct.photoUrl ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-teal-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
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
            <h3 className="text-lg font-extrabold text-white">Publicar atendimento de pet</h3>
            
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
              <label>Descrição do atendimento</label>
              <textarea rows={2} value={editingPost.description || ''} onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
            </div>

            {/* Upload Imagem do Pet */}
            <div className="space-y-1">
              <label>Anexar foto do atendimento</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingPost.photoUrl ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-rose-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
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
            <h3 className="text-lg font-extrabold text-white">Adicionar ou editar foto do espaço</h3>
            
            <div className="space-y-1">
              <label>Título da foto *</label>
              <input type="text" required value={editingPhoto.title || ''} onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white" />
            </div>

            {/* Upload por anexo do dispositivo */}
            <div className="space-y-1">
              <label>Anexar foto do espaço *</label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-slate-800/50 ${
                editingPhoto.url ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 hover:border-indigo-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
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

            <div className="space-y-1">
              <label>Descrição opcional</label>
              <input type="text" value={editingPhoto.description || ''} onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium" />
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
