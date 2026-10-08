'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkspacePhoto } from '@/lib/types';

interface WorkspaceSectionProps {
  photos: WorkspacePhoto[];
}

export function WorkspaceSection({ photos }: WorkspaceSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const checkScrollability = () => {
      setCanScroll(container.scrollWidth - container.clientWidth > 5);
    };

    checkScrollability();

    const observer = new ResizeObserver(() => {
      checkScrollability();
    });

    observer.observe(container);
    window.addEventListener('resize', checkScrollability);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScrollability);
    };
  }, [photos]);

  if (photos.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft <= 15) {
        scrollRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
      }
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
              <span>Ambiente preparado e seguro</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Conheça nosso espaço de trabalho
            </h2>
            <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
              Um ambiente feito sob medida para que seu pet se sinta acolhido, calmo e seguro durante todo o procedimento.
            </p>
          </div>

          {/* Setas de navegação horizontal (visíveis apenas se houver overflow) */}
          {canScroll && (
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
          )}
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
                alt="Foto do espaço"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
