'use client';

import Image from 'next/image';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { ProductItem, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface ProductsSectionProps {
  products: ProductItem[];
  config: SiteConfig;
}

export function ProductsSection({ products, config }: ProductsSectionProps) {
  const availableProducts = products.filter(p => p.isAvailable);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (availableProducts.length === 0) return null;

  return (
    <section id="produtos" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-caramel" />
            <span>Nossa loja</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Produtos e acessórios recomendados
          </h2>
          <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
            Shampoos, laços, roupinhas e perfumes selecionados com carinho para seu pet.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableProducts.map((product) => {
            const productWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Tenho%20interesse%20em%20comprar%20o%20produto%20"${encodeURIComponent(product.name)}"`;

            return (
              <div
                key={product.id}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all border border-brand-sky/30"
              >
                <div className="space-y-4">
                  {/* Photo */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-brand-sky/20 border border-brand-sky/30">
                    <Image
                      src={product.photoUrl || '/images/logo-transparent.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                    />
                    {product.category && (
                      <span className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-lg font-extrabold text-brand-navy mb-1">{product.name}</h3>
                    <p className="text-xs text-brand-navy/70 font-medium leading-relaxed">{product.description}</p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-6 mt-4 border-t border-brand-sky/30 flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-navy">
                    {formatCurrency(product.price)}
                  </span>

                  <a
                    href={productWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    Comprar
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
