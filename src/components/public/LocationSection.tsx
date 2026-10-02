'use client';

import { MapPin, Phone, Instagram } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { SiteConfig } from '@/lib/types';

interface LocationSectionProps {
  config: SiteConfig;
}

export function LocationSection({ config }: LocationSectionProps) {
  const whatsappClean = config.phone.replace(/\D/g, '');

  return (
    <section id="localizacao" className="py-24 bg-gradient-to-b from-[#FAF6F0] to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-brand-sky/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Info Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-brand-caramel" />
              <span>Onde estamos</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Atendimento com hora marcada
            </h2>

            <p className="text-brand-navy/80 text-base font-medium leading-relaxed">
              Para proporcionar máxima atenção, carinho e tranquilidade a cada pet, os banhos e tosas são realizados exclusivamente com agendamento prévio.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Location pill */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-brand-sky/30 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-sky/30 text-brand-navy flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-caramel" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-caramel uppercase">Local de atendimento</span>
                  <p className="text-base font-extrabold text-brand-navy">
                    {config.addressNeighborhood} - {config.addressCity} / {config.addressState}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-brand-sky/30 shadow-sm">
                  <Phone className="w-5 h-5 text-brand-navy shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-brand-navy/60 block">Telefone / WhatsApp</span>
                    <span className="text-sm font-extrabold text-brand-navy">{config.phone}</span>
                  </div>
                </div>

                <a
                  href={config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-brand-sky/30 shadow-sm hover:border-brand-caramel transition-colors group"
                >
                  <Instagram className="w-5 h-5 text-pink-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold text-brand-navy/60 block">Instagram</span>
                    <span className="text-sm font-extrabold text-brand-navy group-hover:text-brand-caramel transition-colors">
                      @lavaujato.banhoetosa
                    </span>
                  </div>
                </a>
              </div>

            </div>

          </div>

          {/* Action Right Column */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-brand-navy text-white space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl">
              ⏰
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Horário de funcionamento</h3>
              <p className="text-sm text-brand-sky font-medium">Segunda a Sábado: 08h às 18h</p>
            </div>

            <a
              href={`https://wa.me/${whatsappClean}?text=Olá,%20gostaria%20de%20solicitar%20o%20endereço%20para%20agendamento.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white" />
              Solicitar agendamento no WhatsApp
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
