'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Heart, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioPost } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

interface PortfolioSectionProps {
  posts: PortfolioPost[];
}

export function PortfolioSection({ posts }: PortfolioSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (posts.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <section id="portfolio" className="py-24 bg-[#FAF6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header com Setas de Navegação */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Nossos Clientes Especiais</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
              Galeria de pets atendidos
            </h2>
            <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
              Confira alguns dos bichinhos que passaram pelo Lav Au Jato e saíram ainda mais lindos!
            </p>
          </div>

          {/* Setas de navegação horizontal */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={scrollLeft}
              aria-label="Pet anterior"
              className="p-3.5 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy hover:bg-brand-sky/30 hover:border-brand-sky shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Próximo pet"
              className="p-3.5 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy hover:bg-brand-sky/30 hover:border-brand-sky shadow-md transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Posts Horizontal Slider */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1"
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between w-[280px] sm:w-[350px] shrink-0"
            >
              <div className="space-y-4 p-5">
                
                {/* Photo Frame */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-brand-sky/20 border border-brand-sky/30">
                  <Image
                    src={post.photoUrl || '/images/logo-white-paws.png'}
                    alt={post.petName}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-brand-navy shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-caramel" />
                    {post.breed || 'Pet Fofinho'}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-xl font-extrabold text-brand-navy">{post.petName}</h3>
                    {post.date && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy/60">
                        <Calendar className="w-3 h-3 text-brand-caramel" />
                        {formatDate(post.date)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-brand-caramel uppercase tracking-wider mb-2">
                    {post.serviceDone}
                  </p>

                  <p className="text-sm text-brand-navy/80 font-medium leading-relaxed">
                    {post.description}
                  </p>
                </div>

              </div>

              {/* Bottom Tag */}
              <div className="bg-brand-sky/20 px-5 py-3 border-t border-brand-sky/30 flex items-center justify-between text-xs font-semibold text-brand-navy">
                <span>Lav Au Jato Banho e Tosa</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
