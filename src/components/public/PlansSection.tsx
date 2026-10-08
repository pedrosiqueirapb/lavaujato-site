'use client';

import { useState } from 'react';
import { Check, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { SubscriptionPlan, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface PlansSectionProps {
  plans: SubscriptionPlan[];
  config: SiteConfig;
}

export function PlansSection({ plans, config }: PlansSectionProps) {
  const [visibleCount, setVisibleCount] = useState(2);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (plans.length === 0) return null;

  const displayedPlans = plans.slice(0, visibleCount);
  const hasMore = plans.length > visibleCount;
  const isExpanded = visibleCount > 2;

  const handleVerMais = () => {
    setVisibleCount(prev => prev + 2);
  };

  const handleVerMenos = () => {
    setVisibleCount(2);
  };

  return (
    <section id="planos" className="py-24 bg-brand-navy text-white relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-sky/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-caramel/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-sky text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Economia e cuidado contínuo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Planos para seu pet
          </h2>
          <p className="text-white/80 text-base sm:text-lg font-medium">
            Mantenha seu pet sempre limpo e cheiroso com nossas opções de banho e tosa, além de facilidade no pagamento via cartão ou PIX.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {displayedPlans.map((plan) => {
            const planWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Tenho%20interesse%20em%20contratar%20o%20"${encodeURIComponent(plan.name)}"`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-brand-navy-light to-brand-navy border-2 border-brand-caramel shadow-2xl scale-105 z-10'
                    : 'glass-panel-dark border border-white/10 hover:border-brand-sky/40'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-caramel text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Plano Mais Recomendado
                  </div>
                )}

                <div className="space-y-6">
                  
                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-white/70 font-medium">{plan.description}</p>
                  </div>

                  <div className="pb-6 border-b border-white/10 space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-brand-sky uppercase tracking-wider block">Valores por porte:</span>
                      <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                        <div>
                          <span className="text-[10px] text-white/60 font-semibold uppercase block">Pequeno</span>
                          <span className="text-sm font-extrabold text-white">
                            {plan.priceSmall ? formatCurrency(plan.priceSmall) : 'Sob consulta'}
                          </span>
                        </div>
                        <div className="border-x border-white/10 px-1">
                          <span className="text-[10px] text-white/60 font-semibold uppercase block">Médio</span>
                          <span className="text-sm font-extrabold text-white">
                            {plan.priceMedium ? formatCurrency(plan.priceMedium) : 'Sob consulta'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/60 font-semibold uppercase block">Grande</span>
                          <span className="text-base font-extrabold text-white">
                            {plan.priceLarge ? formatCurrency(plan.priceLarge) : 'Sob consulta'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bonus Badge */}
                  {plan.bonus && (
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold shadow-sm">
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <span>{plan.bonus}</span>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-brand-sky uppercase tracking-wider">Benefícios inclusos:</p>
                    <ul className="space-y-2.5">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-white/90">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Button */}
                <div className="pt-8 mt-6">
                  <a
                    href={planWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-extrabold text-sm transition-all shadow-lg ${
                      plan.isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    {plan.buttonText || 'Contratar plano'}
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Botões Ver mais / Ver menos */}
        {(hasMore || isExpanded) && (
          <div className="mt-12 flex items-center justify-center gap-4 relative z-10">
            {hasMore && (
              <button
                onClick={handleVerMais}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-caramel hover:bg-amber-600 text-white font-extrabold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <ChevronDown className="w-4 h-4" />
                Ver mais planos
              </button>
            )}
            {isExpanded && (
              <button
                onClick={handleVerMenos}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
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
