'use client';

import Image from 'next/image';
import { Camera, Shield } from 'lucide-react';
import { WorkspacePhoto } from '@/lib/types';

interface WorkspaceSectionProps {
  photos: WorkspacePhoto[];
}

export function WorkspaceSection({ photos }: WorkspaceSectionProps) {
  if (photos.length === 0) return null;

  return (
    <section id="espaco" className="py-24 bg-gradient-to-b from-white to-[#FAF6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
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

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-3xl overflow-hidden glass-card shadow-lg hover:shadow-2xl transition-all aspect-[4/3]"
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
                  <span>Espaço Lava Au Jato</span>
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
