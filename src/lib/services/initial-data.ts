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

export const initialSiteConfig: SiteConfig = {
  phone: '+55 31 7333-5033',
  instagram: 'https://www.instagram.com/lavaujato.banhoetosa',
  addressNeighborhood: 'Bairro Centro / Região Central',
  addressCity: 'Belo Horizonte',
  addressState: 'MG',
  isSandbox: true,
  asaasApiKey: '',
  is2FAEnabled: true,
  admin2FASecret: 'LAVAUJATO2026SECRET',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialServices: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Banho Premium & Hidratação',
    description: 'Banho relaxante com shampoo hipoalergênico, hidratação de pelos, corte de unhas, limpeza de ouvidos e escovação dental.',
    image: '/images/default-hero.jpeg',
    price: 65,
    duration: '60 min',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    title: 'Tosa Higiênica',
    description: 'Manutenção e higiene das patinhas, região genital e barriguinha para conforto e saúde do seu pet.',
    image: '/images/default-hero.jpeg',
    price: 45,
    duration: '45 min',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    title: 'Tosa de Raça / Tesoura',
    description: 'Tosa personalizada de acordo com a raça (Poodle, Shihtzu, Lhasa, Golden) feita com carinho e técnica profissional em tesoura.',
    image: '/images/default-hero.jpeg',
    price: 95,
    duration: '90 min',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    title: 'Banho Terapêutico / Medicina de Pele',
    description: 'Aplicação de banho medicinal sob prescrição veterinária para tratamento de dermatites, fungos e sensibilidades.',
    image: '/images/default-hero.jpeg',
    price: 80,
    duration: '60 min',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const initialPlans: SubscriptionPlan[] = [
  {
    id: 'plan-1',
    name: 'Plano Quinzenal (2 Banhos/mês)',
    price: 110,
    period: 'mensal',
    description: 'Perfeito para manter seu melhor amigo sempre limpinho e cheiroso a cada 15 dias.',
    benefits: [
      '2 Banhos com hidratação leve',
      '1 Tosa higiênica inclusa',
      'Limpeza de ouvidos e corte de unhas',
      'Desconto de 10% em tosas completas',
      'Horário preferencial na agenda'
    ],
    isPopular: false,
    buttonText: 'Contratar plano',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    name: 'Plano Semanal (4 Banhos/mês)',
    price: 199,
    period: 'mensal',
    description: 'O tratamento completo para quem ama ver o pet impecável toda semana!',
    benefits: [
      '4 Banhos com hidratação profunda',
      'Tosa higiênica quinzenal ilimitada',
      'Corte de unhas e escovação dental em todas as sessões',
      '1 Tosa tesoura/geral grátis a cada 3 meses',
      'Tele-busca grátis (sob consulta de região)'
    ],
    isPopular: true,
    buttonText: 'Contratar plano',
    createdAt: new Date().toISOString(),
  }
];

export const initialWorkspacePhotos: WorkspacePhoto[] = [
  {
    id: 'ws-1',
    url: '/images/logo-white-paws.png',
    title: 'Espaço limpo e higienizado',
    description: 'Ambiente climatizado e desinfetado a cada atendimento.',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ws-2',
    url: '/images/logo-blue.png',
    title: 'Banhadeiras e secadores silenciosos',
    description: 'Equipamentos modernos para diminuir o estresse do animal.',
    order: 2,
    createdAt: new Date().toISOString(),
  }
];

export const initialPortfolioPosts: PortfolioPost[] = [
  {
    id: 'port-1',
    petName: 'Thor',
    breed: 'Golden Retriever',
    serviceDone: 'Banho VIP + Hidratação de Pelos',
    description: 'Thor aprontou no jardim e ficou novinho em folha depois de um banho bem gostoso!',
    photoUrl: '/images/logo-white-paws.png',
    date: '2026-09-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'port-2',
    petName: 'Mel',
    breed: 'Shih Tzu',
    serviceDone: 'Tosa Bebe na Tesoura',
    description: 'A princesa Mel ficou super charmosinha com o laço rosa e pelos aparados na tesoura.',
    photoUrl: '/images/logo-blue.png',
    date: '2026-09-22',
    createdAt: new Date().toISOString(),
  }
];

export const initialPromotions: PromotionItem[] = [
  {
    id: 'promo-1',
    title: 'Promoção de boas-vindas',
    description: 'Ganha 15% de desconto no primeiro banho do seu pet agendando pelo WhatsApp!',
    discountText: '15% OFF no 1º Banho',
    badge: 'Especial 🎁',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

export const initialProducts: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Shampoo hipoalergênico pet glow 500ml',
    description: 'Shampoo com extrato de camomila e maciez extrema para peles sensíveis.',
    price: 39.90,
    category: 'Higiene',
    photoUrl: '/images/logo-transparent.png',
    isAvailable: true,
    createdAt: new Date().toISOString(),
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Mariana Silva',
    phone: '(31) 99887-6655',
    email: 'mariana.silva@gmail.com',
    petName: 'Thor',
    petBreed: 'Golden Retriever',
    petSize: 'Grande',
    notes: 'Alergia a perfume forte.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  }
];

export const initialCharges: AsaasCharge[] = [
  {
    id: 'chg-1',
    customerId: 'cli-1',
    customerName: 'Mariana Silva',
    value: 199.00,
    description: 'Assinatura Plano Semanal VIP (Setembro)',
    billingType: 'CREDIT_CARD',
    cycle: 'MONTHLY',
    status: 'RECEIVED',
    invoiceUrl: 'https://asaas.com/i/demo123456',
    createdAt: new Date().toISOString(),
  }
];
