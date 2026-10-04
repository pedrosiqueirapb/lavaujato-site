import { StorageService } from '@/lib/services/storage.service';
import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { ServicesSection } from '@/components/public/ServicesSection';
import { WorkspaceSection } from '@/components/public/WorkspaceSection';
import { PlansSection } from '@/components/public/PlansSection';
import { PortfolioSection } from '@/components/public/PortfolioSection';
import { PromosSection } from '@/components/public/PromosSection';
import { ProductsSection } from '@/components/public/ProductsSection';
import { LocationSection } from '@/components/public/LocationSection';
import { Footer } from '@/components/public/Footer';

// Revalidação dinâmica a cada requisição
export const revalidate = 0;

export default function HomePage() {
  const config = StorageService.getSiteConfig();
  const services = StorageService.getServices();
  const workspacePhotos = StorageService.getWorkspacePhotos();
  const plans = StorageService.getPlans();
  const portfolioPosts = StorageService.getPortfolioPosts();
  const promotions = StorageService.getPromotions(true); // Apenas ativas
  const products = StorageService.getProducts(true); // Apenas disponíveis

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

      <PortfolioSection posts={portfolioPosts} />

      <PromosSection promotions={promotions} config={config} />

      <ProductsSection products={products} config={config} />

      <LocationSection config={config} />

      <Footer config={config} />
    </main>
  );
}
