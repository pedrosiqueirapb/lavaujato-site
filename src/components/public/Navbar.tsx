'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Sparkles, ShoppingBag } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { SiteConfig } from '@/lib/types';

interface NavbarProps {
  config: SiteConfig;
  hasPlans?: boolean;
  hasPromos?: boolean;
  hasProducts?: boolean;
}

export function Navbar({ config, hasPlans, hasPromos, hasProducts }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappClean = config.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Gostaria%20de%20agendar%20um%20banho/tosa%20para%20o%20meu%20pet.`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2 glass-panel shadow-md' : 'py-4 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-sky bg-white p-1 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo-transparent.png"
              alt="Lav Au Jato Banho e Tosa"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-brand-navy leading-none tracking-tight">
              LAV AU JATO
            </span>
            <span className="text-xs font-semibold text-brand-caramel uppercase tracking-widest mt-0.5">
              Banho e Tosa
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#servicos" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors">
            Serviços
          </Link>
          <Link href="/#espaco" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors">
            Nosso espaço
          </Link>
          {hasPlans && (
            <Link href="/#planos" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors">
              Planos
            </Link>
          )}
          <Link href="/#portfolio" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors">
            Galeria
          </Link>
          {hasPromos && (
            <Link href="/#promocoes" className="text-sm font-semibold text-brand-caramel flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-caramel" />
              Promoções
            </Link>
          )}
          {hasProducts && (
            <Link href="/produtos" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-brand-caramel" />
              Produtos
            </Link>
          )}
          <Link href="/#localizacao" className="text-sm font-semibold text-brand-navy hover:text-brand-caramel transition-colors">
            Localização
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            Agendar no WhatsApp
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-brand-navy hover:bg-brand-sky/20 focus:outline-none"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-brand-sky/30 px-4 pt-4 pb-6 mt-2 space-y-3 animate-in slide-in-from-top duration-200">
          <Link
            href="/#servicos"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2"
          >
            Serviços
          </Link>
          <Link
            href="/#espaco"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2"
          >
            Nosso espaço
          </Link>
          {hasPlans && (
            <Link
              href="/#planos"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2"
            >
              Planos
            </Link>
          )}
          <Link
            href="/#portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2"
          >
            Galeria
          </Link>
          {hasPromos && (
            <Link
              href="/#promocoes"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-bold text-brand-caramel py-2 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Promoções Ativas
            </Link>
          )}
          {hasProducts && (
            <Link
              href="/produtos"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-brand-caramel" /> Produtos
            </Link>
          )}
          <Link
            href="/#localizacao"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-brand-navy hover:text-brand-caramel py-2"
          >
            Localização
          </Link>
          <div className="pt-2 border-t border-brand-sky/20 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              Agendar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
