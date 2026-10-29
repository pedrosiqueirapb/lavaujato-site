'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { SiteConfig } from '@/lib/types';

interface FooterProps {
  config: SiteConfig;
  hasServices?: boolean;
  hasWorkspace?: boolean;
  hasPortfolio?: boolean;
  hasPlans?: boolean;
  hasPromos?: boolean;
  hasProducts?: boolean;
}

export function Footer({ config, hasServices = false, hasWorkspace = false, hasPortfolio = false, hasPlans = false, hasPromos = false, hasProducts = false }: FooterProps) {
  // Mesma ordem das seções na página principal
  const navItems = [
    { href: '/#servicos', label: 'Serviços', show: hasServices },
    { href: '/#fidelidade', label: 'Cartão fidelidade', show: true },
    { href: '/#planos', label: 'Planos', show: hasPlans },
    { href: '/#promocoes', label: 'Promoções', show: hasPromos },
    { href: '/#espaco', label: 'Nosso espaço', show: hasWorkspace },
    { href: '/#portfolio', label: 'Galeria', show: hasPortfolio },
    { href: '/produtos', label: 'Produtos', show: hasProducts },
    { href: '/#localizacao', label: 'Onde estamos', show: true },
  ];
  const address = [config.addressNeighborhood, config.addressCity].filter(Boolean).join(', ') +
    (config.addressState ? ` - ${config.addressState}` : '');
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
                  alt="Lav Au Jato Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white block">LAV AU JATO</span>
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
                aria-label="Instagram Lav Au Jato"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label="WhatsApp Lav Au Jato"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-brand-sky uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-2 text-sm text-white/80 font-medium">
              {navItems.map((it) =>
                it.show ? (
                  <li key={it.href}>
                    <Link href={it.href} className="hover:text-brand-caramel transition-colors">{it.label}</Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          {/* Contact Summary */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm font-extrabold text-brand-sky uppercase tracking-wider">Atendimento</h3>
            <p className="text-sm text-white/80 font-medium">
              📍 {address}
            </p>
            <p className="text-sm text-white/80 font-medium">
              📞 {config.phone}
            </p>
          </div>

        </div>

        {/* Bottom Bar with Autojade Credit (Requirement 13) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-medium">
          <p>© 2026 Lav Au Jato Banho e Tosa. Todos os direitos reservados.</p>
          
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
