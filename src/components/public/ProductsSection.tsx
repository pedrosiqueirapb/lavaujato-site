'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { ProductItem, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface ProductsSectionProps {
  products: ProductItem[];
  config: SiteConfig;
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const availableProducts = products.filter(p => p.isAvailable);

  if (availableProducts.length === 0) return null;

  // Mostra até 3 produtos de amostra no card da home
  const previewProducts = availableProducts.slice(0, 3);

  return (
    <section id="produtos-banner" className="py-20 bg-gradient-to-b from-white to-[#FAF6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-brand-sky/40 shadow-xl relative overflow-hidden">
          
          {/* Decorative Background Accents */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-sky/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-caramel/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-brand-caramel" />
                <span>Nossa loja</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
                Produtos e acessórios especiais para o seu pet 🐾
              </h2>

              <p className="text-brand-navy/80 text-base font-medium leading-relaxed">
                Produtos para pets, selecionados de acordo com as necessidades do dia a dia.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/produtos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-base shadow-lg shadow-brand-navy/20 transition-all hover:scale-105 active:scale-95 group"
                >
                  <span>Ver todos os produtos</span>
                  <ArrowRight className="w-5 h-5 text-brand-sky group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Products Preview Cards */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {previewProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-brand-sky/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-brand-sky/10 border border-brand-sky/20">
                        <Image
                          src={product.photoUrl || '/images/logo-transparent.png'}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-brand-navy line-clamp-1">{product.name}</h3>
                        <p className="text-[10px] text-brand-caramel font-bold uppercase">{product.category || 'Acessórios'}</p>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-brand-sky/20 flex items-center justify-between">
                      <span className="text-sm font-black text-brand-navy">{formatCurrency(product.price)}</span>
                      <Sparkles className="w-3.5 h-3.5 text-brand-caramel" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
