'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkspacePhoto } from '@/lib/types';

interface WorkspaceSectionProps {
  photos: WorkspacePhoto[];
}

export function WorkspaceSection({ photos }: WorkspaceSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section id="espaco" className="py-24 bg-gradient-to-b from-white to-[#FAF6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header com Setas de Navegação */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-brand-caramel" />
              <span>Ambiente Preparado & Seguro</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Conheça nosso espaço de trabalho
            </h2>
            <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
              Um ambiente feito sob medida para que seu pet se sinta acolhido, calmo e seguro durante todo o procedimento.
            </p>
          </div>

          {/* Setas de navegação horizontal */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={scrollLeft}
              aria-label="Foto anterior"
              className="p-3.5 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy hover:bg-brand-sky/30 hover:border-brand-sky shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Próxima foto"
              className="p-3.5 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy hover:bg-brand-sky/30 hover:border-brand-sky shadow-md transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photos Horizontal Slider */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1"
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-3xl overflow-hidden glass-card shadow-lg hover:shadow-2xl transition-all aspect-[4/3] w-[280px] sm:w-[360px] md:w-[400px] shrink-0"
            >
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1">
                <div className="flex items-center gap-2 text-brand-sky text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Espaço Lav Au Jato</span>
                </div>
                <h3 className="text-xl font-bold text-white">{photo.title}</h3>
                {photo.description && (
                  <p className="text-xs text-white/80 font-medium line-clamp-2">{photo.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
