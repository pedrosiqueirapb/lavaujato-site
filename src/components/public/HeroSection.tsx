'use client';

import Image from 'next/image';
import { Heart, Sparkles, Star, Award, PhoneCall } from 'lucide-react';
import { SiteConfig } from '@/lib/types';

interface HeroSectionProps {
  config: SiteConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const whatsappClean = config.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20serviços.`;

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 flex items-center justify-center overflow-hidden bg-gradient-to-b from-brand-sky-light via-[#FAF6F0] to-white">
      
      {/* Dynamic Bubble Animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="bubble w-16 h-16 top-1/4 left-[10%] animate-float" />
        <div className="bubble w-24 h-24 top-1/3 right-[12%] animate-float-slow" />
        <div className="bubble w-12 h-12 bottom-1/4 left-[20%] animate-float" />
        <div className="bubble w-20 h-20 bottom-1/3 right-[25%] animate-float-slow" />
        <div className="bubble w-10 h-10 top-1/2 left-[45%] animate-float" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Left Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-sky/40 border border-brand-sky text-brand-navy text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-caramel animate-spin" />
              <span>Banho e tosa especializado com amabilidade e carinho</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy leading-tight tracking-tight">
              O carinho e o cuidado que o seu <span className="text-brand-caramel relative inline-block">
                pet merece
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-brand-sky/50 -z-10 rounded-full" />
              </span> 🐾
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-brand-navy/80 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              No <strong className="text-brand-navy font-bold">Lava Au Jato</strong>, cada banho, tosa e hidratação é feito com atenção individualizada, produtos hipoalergênicos e ambiente seguro e limpinho.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <PhoneCall className="w-5 h-5 fill-current stroke-[2.5]" />
                Agendar horário para meu pet
              </a>

              <a
                href="#planos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-brand-navy/20 hover:border-brand-caramel text-brand-navy hover:text-brand-caramel font-bold text-base transition-all glass-card"
              >
                <Star className="w-5 h-5 text-brand-caramel" />
                Conhecer nossos planos
              </a>
            </div>

          </div>

          {/* Image Right Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Glowing Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-sky to-brand-caramel/30 rounded-3xl blur-2xl opacity-50 animate-pulse-glow" />

            {/* Main Card Frame - ONLY LOGO (Retângulo removido como solicitado) */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 glass-card border-2 border-white shadow-2xl flex items-center justify-center">
              
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/images/logo-white-paws.png"
                  alt="Lava Au Jato Logo"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
