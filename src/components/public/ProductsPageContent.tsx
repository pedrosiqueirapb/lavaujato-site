'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { ProductItem, SiteConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface ProductsPageContentProps {
  products: ProductItem[];
  config: SiteConfig;
}

const ITEMS_PER_PAGE = 15;

export function ProductsPageContent({ products, config }: ProductsPageContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');

  const whatsappClean = config.phone.replace(/\D/g, '');

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter((c): c is string => Boolean(c))));
    return ['TODOS', ...cats];
  }, [products]);

  // Filtragem por categoria
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'TODOS') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="pt-28 pb-24 bg-[#FAF6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-navy/70 hover:text-brand-caramel transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página principal</span>
          </Link>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sky/40 text-brand-navy text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-caramel" />
            <span>Catálogo Completo</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight">
            Produtos e acessórios recomendados
          </h1>
          <p className="text-brand-navy/80 text-base sm:text-lg font-medium leading-relaxed">
            Navegue por nossa linha de shampoos, condicionadores, laços, roupinhas e perfumes escolhidos especialmente para deixar seu pet impecável.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy/60 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-white text-brand-navy hover:bg-brand-sky/30 border border-brand-sky/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProducts.map((product) => {
            const productWhatsappUrl = `https://wa.me/${whatsappClean}?text=Olá!%20Tenho%20interesse%20em%20comprar%20o%20produto%20"${encodeURIComponent(product.name)}"`;

            return (
              <div
                key={product.id}
                className="glass-card rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all border border-brand-sky/40 bg-white/80"
              >
                <div className="space-y-4">
                  {/* Photo */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-brand-sky/20 border border-brand-sky/30">
                    <Image
                      src={product.photoUrl || '/images/logo-transparent.png'}
                      alt={product.name}
                      fill
                      className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                    />
                    {product.category && (
                      <span className="absolute top-3 left-3 bg-brand-navy text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-navy mb-1">{product.name}</h3>
                    <p className="text-xs text-brand-navy/70 font-medium leading-relaxed">{product.description}</p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-6 mt-4 border-t border-brand-sky/30 flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-navy">
                    {formatCurrency(product.price)}
                  </span>

                  <a
                    href={productWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                    Comprar no WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="p-3 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-sky/30 shadow-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-2xl font-extrabold text-xs transition-all ${
                    currentPage === pageNum
                      ? 'bg-brand-navy text-white shadow-md'
                      : 'bg-white text-brand-navy hover:bg-brand-sky/30 border border-brand-sky/40'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
              className="p-3 rounded-2xl bg-white border border-brand-sky/40 text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-sky/30 shadow-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
