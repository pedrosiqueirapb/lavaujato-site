'use client';

import Image from 'next/image';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { PortfolioPost } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

interface PortfolioSectionProps {
  posts: PortfolioPost[];
}

export function PortfolioSection({ posts }: PortfolioSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section id="portfolio" className="py-24 bg-[#FAF6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
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

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="glass-card rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
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
