'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { ServiceItem, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface ServicesSectionProps {
  services: ServiceItem[];
  config: SiteConfig;
}

export function ServicesSection({ services, config }: ServicesSectionProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  const activeServices = services.filter(s => s.isActive);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (activeServices.length === 0) return null;

  const displayedServices = activeServices.slice(0, visibleCount);
  const hasMore = activeServices.length > visibleCount;
  const isExpanded = visibleCount > 4;

  const handleVerMais = () => {
    setVisibleCount(prev => prev + 4);
  };

  const handleVerMenos = () => {
    setVisibleCount(4);
  };

  return (
    <section id="servicos" className="py-24 bg-white relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-sky/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/30 border border-brand-sky text-brand-navy text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-caramel" />
            <span>Nossos cuidados especializados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Nossos serviços
          </h2>
          <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
            Escolha o serviço ideal para o seu pet. Trabalhamos com cuidado e atenção em cada atendimento.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedServices.map((service, index) => {
            const serviceWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Gostaria%20de%20agendar%20o%20serviço%20"${encodeURIComponent(service.title)}"`;
            const isOddLast = displayedServices.length % 2 !== 0 && index === displayedServices.length - 1;

            return (
              <div
                key={service.id}
                className={`glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-brand-caramel/50 shadow-md hover:shadow-xl transition-all ${
                  isOddLast ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Image & Title Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-brand-sky/30 shrink-0 border border-brand-sky/40">
                      <Image
                        src={service.image || '/images/logo-white-paws.png'}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-brand-navy group-hover:text-brand-caramel transition-colors">
                        {service.title}
                      </h3>
                      {service.duration && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy/60 mt-1">
                          <Clock className="w-3.5 h-3.5 text-brand-caramel" />
                          {service.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-brand-navy/80 text-sm sm:text-base leading-relaxed font-medium">
                    {service.description}
                  </p>
                </div>

                {/* Footer Price & Action */}
                <div className="pt-6 mt-6 border-t border-brand-sky/30 flex items-center justify-between gap-4">
                  <div>
                    {service.price && service.price > 0 ? (
                      <div>
                        <span className="text-xs font-semibold text-brand-navy/60 block">A partir de</span>
                        <span className="text-2xl font-extrabold text-brand-navy">{formatCurrency(service.price)}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-semibold text-brand-navy/60 block">Valor</span>
                        <span className="text-sm sm:text-base font-extrabold text-brand-caramel">Sob consulta</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={serviceWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    Agendar
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <ChevronDown className="w-4 h-4" />
                Ver mais
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

        {/* Custom Service Note */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-sky/20 border border-brand-sky/40 text-center max-w-4xl mx-auto flex items-center justify-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-brand-navy leading-relaxed">
            Tem alguma necessidade específica ou dúvida sobre o serviço? Fale com a gente pelo WhatsApp.
          </p>
        </div>

      </div>
    </section>
  );
}
