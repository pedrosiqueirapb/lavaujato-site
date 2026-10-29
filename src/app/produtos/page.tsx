import { redirect } from 'next/navigation';
import { StorageService } from '@/lib/services/storage.service';
import { Navbar } from '@/components/public/Navbar';
import { ProductsPageContent } from '@/components/public/ProductsPageContent';
import { Footer } from '@/components/public/Footer';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return {
    title: 'Produtos e acessórios recomendados',
    description: 'Confira nossa linha de produtos, shampoos hipoalergênicos e acessórios para seu pet.',
  };
}

export default async function ProductsPage() {
  const safe = async <T,>(p: Promise<T>, f: T) => { try { return await p; } catch { return f; } };
  const [config, products, plans, promotions] = await Promise.all([
    StorageService.getPublicSiteConfig(),
    safe(StorageService.getProducts(true), []),
    safe(StorageService.getPlans(), []),
    safe(StorageService.getPromotions(true), []),
  ]);

  // Se não houver produtos cadastrados/disponíveis, a rota /produtos não é acessível
  if (products.length === 0) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#FAF6F0] selection:bg-brand-sky selection:text-brand-navy">
      <Navbar
        config={config}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={true}
      />

      <ProductsPageContent products={products} config={config} />

      <Footer
        config={config}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={true}
      />
    </main>
  );
}
