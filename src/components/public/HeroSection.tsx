'use client';

import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { SiteConfig } from '@/lib/types';

interface HeroSectionProps {
  config: SiteConfig;
  hasPlans?: boolean;
}

export function HeroSection({ config, hasPlans }: HeroSectionProps) {
  const whatsappClean = config.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20serviços.`;

  return (
    <section className="relative min-h-[92vh] pt-32 pb-24 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#BCDAE6] via-[#CFE6F0] to-[#E9F3F7]">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-10 left-[-5%] w-[450px] h-[450px] glow-orb-sky rounded-full blur-3xl pointer-events-none opacity-90 animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] glow-orb-caramel rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-white/40 rounded-full blur-3xl pointer-events-none" />

      {/* Dynamic Bubble Animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="bubble w-16 h-16 top-1/4 left-[8%] animate-float" />
        <div className="bubble w-28 h-28 top-1/3 right-[10%] animate-float-slow" />
        <div className="bubble w-14 h-14 bottom-1/4 left-[18%] animate-float" />
        <div className="bubble w-20 h-20 bottom-1/3 right-[22%] animate-float-slow" />
        <div className="bubble w-10 h-10 top-1/2 left-[42%] animate-float" />
        <div className="bubble w-16 h-16 top-16 right-[35%] animate-float-slow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Left Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/90 border border-brand-navy/20 text-brand-navy text-xs sm:text-sm font-extrabold shadow-md">
              <Sparkles className="w-4 h-4 text-brand-caramel" />
              <span>Banho e tosa com cuidado em cada detalhe</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy leading-[1.15] tracking-tight">
              O carinho e o cuidado que o seu pet merece 🐾
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-brand-navy/85 font-semibold max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              No <strong className="text-brand-navy font-black">Lav Au Jato</strong>, seu pet recebe banho e tosa com produtos hipoalergênicos, carinho dedicado e um ambiente seguro e higienizado.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-600/45 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <WhatsAppIcon className="w-6 h-6 fill-white" />
                Agendar horário para meu pet
              </a>

              {hasPlans && (
                <a
                  href="#planos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/60 hover:bg-white/90 border-2 border-brand-navy/30 text-brand-navy font-extrabold text-base transition-all shadow-md hover:shadow-lg"
                >
                  <Star className="w-5 h-5 text-brand-caramel fill-brand-caramel" />
                  Conhecer nossos planos
                </a>
              )}
            </div>

          </div>

          {/* Image Right Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Glowing Backdrop */}
            <div className="absolute -inset-6 bg-gradient-to-r from-brand-sky via-brand-caramel/40 to-brand-sky rounded-full blur-3xl opacity-70 animate-pulse-glow" />

            {/* Main Card Frame with Logo */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 bg-white/75 backdrop-blur-md border-2 border-white/90 shadow-2xl flex items-center justify-center">
              
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/images/logo-white-paws.png"
                  alt="Lav Au Jato Logo"
                  fill
                  className="object-contain drop-shadow-xl"
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
