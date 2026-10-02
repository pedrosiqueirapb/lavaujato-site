'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';
import { SiteConfig } from '@/lib/types';

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config }: FooterProps) {
  const whatsappClean = config.phone.replace(/\D/g, '');

  return (
    <footer className="bg-brand-navy-dark text-white pt-16 pb-8 border-t border-white/10 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-sky bg-white p-1">
                <Image
                  src="/images/logo-white-paws.png"
                  alt="Lava Au Jato Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white block">LAVA AU JATO</span>
                <span className="text-xs font-semibold text-brand-sky uppercase tracking-widest">
                  Banho e Tosa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={config.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="Instagram Lava Au Jato"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="WhatsApp Lava Au Jato"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-brand-sky uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-2 text-sm text-white/80 font-medium">
              <li><Link href="#servicos" className="hover:text-brand-caramel transition-colors">Serviços</Link></li>
              <li><Link href="#espaco" className="hover:text-brand-caramel transition-colors">Nosso espaço</Link></li>
              <li><Link href="#planos" className="hover:text-brand-caramel transition-colors">Planos</Link></li>
              <li><Link href="#portfolio" className="hover:text-brand-caramel transition-colors">Galeria</Link></li>
              <li><Link href="#localizacao" className="hover:text-brand-caramel transition-colors">Onde estamos</Link></li>
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm font-extrabold text-brand-sky uppercase tracking-wider">Atendimento</h3>
            <p className="text-sm text-white/80 font-medium">
              📍 {config.addressNeighborhood}, {config.addressCity} - {config.addressState}
            </p>
            <p className="text-sm text-white/80 font-medium">
              📞 {config.phone}
            </p>
          </div>

        </div>

        {/* Bottom Bar with Autojade Credit (Requirement 13) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-medium">
          <p>© 2026 Lava Au Jato Banho e Tosa. Todos os direitos reservados.</p>
          
          {/* Requirement 13: Texto bem pequeno e discreto "Desenvolvido por Autojade" com link */}
          <p className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
            Desenvolvido por{' '}
            <a
              href="https://autojade.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-brand-sky transition-colors"
            >
              Autojade
            </a>
          </p>
        </div>

      </div>

    </footer>
  );
}
