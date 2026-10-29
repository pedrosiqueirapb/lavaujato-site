import { StorageService } from '@/lib/services/storage.service';
import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { ServicesSection } from '@/components/public/ServicesSection';
import { WorkspaceSection } from '@/components/public/WorkspaceSection';
import { PlansSection } from '@/components/public/PlansSection';
import { PortfolioSection } from '@/components/public/PortfolioSection';
import { LoyaltySection } from '@/components/public/LoyaltySection';
import { PromosSection } from '@/components/public/PromosSection';
import { ProductsSection } from '@/components/public/ProductsSection';
import { LocationSection } from '@/components/public/LocationSection';
import { Footer } from '@/components/public/Footer';

// Revalidação dinâmica a cada requisição
export const dynamic = 'force-dynamic';

const safe = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
  try { return await p; } catch (e) { console.error(e); return fallback; }
};

export default async function HomePage() {
  const [config, services, workspacePhotos, plans, portfolioPosts, promotions, products] = await Promise.all([
    StorageService.getPublicSiteConfig(),
    safe(StorageService.getServices(true), []),
    safe(StorageService.getWorkspacePhotos(), []),
    safe(StorageService.getPlans(), []),
    safe(StorageService.getPortfolioPosts(), []),
    safe(StorageService.getPromotions(true), []),
    safe(StorageService.getProducts(true), []),
  ]);

  return (
    <main className="min-h-screen bg-[#FAF6F0] selection:bg-brand-sky selection:text-brand-navy">
      <Navbar
        config={config}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={products.length > 0}
      />

      <HeroSection config={config} hasPlans={plans.length > 0} />

      <ServicesSection services={services} config={config} />

      <WorkspaceSection photos={workspacePhotos} />

      <PlansSection plans={plans} config={config} />

      <LoyaltySection config={config} />

      <PortfolioSection posts={portfolioPosts} />

      <PromosSection promotions={promotions} config={config} />

      <ProductsSection products={products} config={config} />

      <LocationSection config={config} />

      <Footer
        config={config}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={products.length > 0}
      />
    </main>
  );
}
