'use client';

import { Tag } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { PromotionItem, SiteConfig } from '@/lib/types';

interface PromosSectionProps {
  promotions: PromotionItem[];
  config: SiteConfig;
}

export function PromosSection({ promotions, config }: PromosSectionProps) {
  const activePromos = promotions.filter(p => p.isActive);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (activePromos.length === 0) return null;

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
            Aproveite os descontos ativos por tempo limitado para o banho e tosa do seu pet!
          </p>
        </div>

        {/* Promos Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {activePromos.map((promo) => {
            const promoWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Quero%20aproveitar%20a%20promoção%20"${encodeURIComponent(promo.title)}"`;

            return (
              <div
                key={promo.id}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-amber-400 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all"
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

      </div>
    </section>
  );
}
