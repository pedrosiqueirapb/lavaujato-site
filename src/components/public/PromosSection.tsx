'use client';

import { useState } from 'react';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { PromotionItem, SiteConfig } from '@/lib/types';

interface PromosSectionProps {
  promotions: PromotionItem[];
  config: SiteConfig;
}

export function PromosSection({ promotions, config }: PromosSectionProps) {
  const [visibleCount, setVisibleCount] = useState(2);
  const activePromos = promotions.filter(p => p.isActive);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (activePromos.length === 0) return null;

  const displayedPromos = activePromos.slice(0, visibleCount);
  const hasMore = activePromos.length > visibleCount;
  const isExpanded = visibleCount > 2;

  const handleVerMais = () => {
    setVisibleCount(prev => prev + 2);
  };

  const handleVerMenos = () => {
    setVisibleCount(2);
  };

  return (
    <section id="promocoes" className="py-20 bg-gradient-to-r from-amber-500/10 via-brand-sky/30 to-amber-500/10 border-y border-amber-500/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-black uppercase tracking-widest shadow-md animate-bounce">
            <Tag className="w-3.5 h-3.5 fill-current" />
            <span>Oportunidade Especial</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Promoções em destaque 🎁
          </h2>
          <p className="text-brand-navy/80 font-semibold text-sm sm:text-base">
            Confira nossas promoções e condições especiais!
          </p>
        </div>

        {/* Promos Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {displayedPromos.map((promo, index) => {
            const promoWhatsappUrl = `https://wa.me/${whatsappClean}`;
            const isOddLast = displayedPromos.length % 2 !== 0 && index === displayedPromos.length - 1;

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-400 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all ${
                  isOddLast ? 'md:col-span-2 md:max-w-md md:mx-auto w-full' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full uppercase tracking-wider">
                      {promo.badge || 'Desconto Ativo'}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-brand-navy">{promo.title}</h3>
                  <p className="text-sm font-medium text-brand-navy/80">{promo.description}</p>

                  <div className="pt-2">
                    <span className="text-2xl font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl inline-block border border-amber-200">
                      {promo.discountText}
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <a
                    href={promoWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    Garantir esta promoção no WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botões Ver mais / Ver menos */}
        {(hasMore || isExpanded) && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {hasMore && (
              <button
                onClick={handleVerMais}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <ChevronDown className="w-4 h-4" />
                Ver mais promoções
              </button>
            )}
            {isExpanded && (
              <button
                onClick={handleVerMenos}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-brand-navy font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
              >
                <ChevronUp className="w-4 h-4" />
                Ver menos
              </button>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
