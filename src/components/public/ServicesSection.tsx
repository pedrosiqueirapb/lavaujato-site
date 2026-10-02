'use client';

import Image from 'next/image';
import { MessageCircle, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { ServiceItem, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface ServicesSectionProps {
  services: ServiceItem[];
  config: SiteConfig;
}

export function ServicesSection({ services, config }: ServicesSectionProps) {
  const activeServices = services.filter(s => s.isActive);
  const whatsappClean = config.phone.replace(/\D/g, '');

  if (activeServices.length === 0) return null;

  return (
    <section id="servicos" className="py-24 bg-white relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-sky/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/30 border border-brand-sky text-brand-navy text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-caramel" />
            <span>Nossos Cuidados Especializados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Serviços de Banho, Tosa & Estética Pet
          </h2>
          <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
            Escolha o tratamento ideal para o bem-estar do seu pet. Cada serviço é feito com paciência e carinho.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {activeServices.map((service) => {
            const serviceWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Gostaria%20de%20agendar%20o%20serviço%20"${encodeURIComponent(service.title)}"`;

            return (
              <div
                key={service.id}
                className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-brand-caramel/50 shadow-md hover:shadow-xl transition-all"
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
                    {service.price ? (
                      <div>
                        <span className="text-xs font-semibold text-brand-navy/60 block">A partir de</span>
                        <span className="text-2xl font-extrabold text-brand-navy">{formatCurrency(service.price)}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-brand-caramel">Consultar Valor</span>
                    )}
                  </div>

                  <a
                    href={serviceWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Agendar
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Custom Service Note */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-sky/20 border border-brand-sky/40 text-center max-w-2xl mx-auto flex items-center justify-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-brand-navy">
            Precisa de um banho medicinal com receita ou tosa específica? Agende diretamente pelo WhatsApp!
          </p>
        </div>

      </div>
    </section>
  );
}
