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

export default async function HomePage() {
  const [config, services, workspacePhotos, plans, portfolioPosts, promotions, products] = await Promise.all([
    StorageService.getSiteConfig(),
    StorageService.getServices(true),
    StorageService.getWorkspacePhotos(),
    StorageService.getPlans(),
    StorageService.getPortfolioPosts(),
    StorageService.getPromotions(true),
    StorageService.getProducts(true),
  ]);

  // Dados estruturados (SEO) montados a partir do cadastro real do painel.
  const phoneDigits = (config.phone || '').replace(/\D/g, '');
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'PetGrooming',
    name: 'Lav Au Jato Banho e Tosa',
    image: 'https://lavaujato.com.br/images/logo-white-paws.png',
    '@id': 'https://lavaujato.com.br',
    url: 'https://lavaujato.com.br',
    description: 'Banho e tosa com cuidado em cada detalhe. Atendimento individualizado, produtos hipoalergênicos e ambiente seguro e higienizado.',
  };
  if (phoneDigits) jsonLd.telephone = `+${phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`}`;
  if (config.addressCity || config.addressState) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(config.addressCity ? { addressLocality: config.addressCity } : {}),
      ...(config.addressState ? { addressRegion: config.addressState } : {}),
      addressCountry: 'BR',
    };
  }

  return (
    <main className="min-h-screen bg-[#FAF6F0] selection:bg-brand-sky selection:text-brand-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Navbar
        config={config}
        hasServices={services.length > 0}
        hasWorkspace={workspacePhotos.length > 0}
        hasPortfolio={portfolioPosts.length > 0}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={products.length > 0}
      />

      <HeroSection config={config} hasPlans={plans.length > 0} />

      <ServicesSection services={services} config={config} />

      <LoyaltySection config={config} />

      <PlansSection plans={plans} config={config} />

      <PromosSection promotions={promotions} config={config} />

      <WorkspaceSection photos={workspacePhotos} />

      <PortfolioSection posts={portfolioPosts} />

      <ProductsSection products={products} config={config} />

      <LocationSection config={config} />

      <Footer
        config={config}
        hasServices={services.length > 0}
        hasWorkspace={workspacePhotos.length > 0}
        hasPortfolio={portfolioPosts.length > 0}
        hasPlans={plans.length > 0}
        hasPromos={promotions.length > 0}
        hasProducts={products.length > 0}
      />
    </main>
  );
}
