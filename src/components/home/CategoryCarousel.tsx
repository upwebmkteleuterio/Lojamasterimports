"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCategoryCarousel } from '@/hooks/useCategoryCarousel';

interface Category {
  id: string;
  name: string;
  image_url: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  shopType: string;
}

export const CategoryCarousel = ({ categories, shopType }: CategoryCarouselProps) => {
  const { emblaRef, scrollPrev, scrollNext } = useCategoryCarousel();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 md:py-20 container mx-auto px-4">
      {/* Header com Título e Setas */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h2 className="text-xl md:text-3xl font-serif text-gray-800">Escolha por categorias</h2>
        
        {/* Setas Visíveis apenas no PC */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#B89C6A] hover:text-[#B89C6A] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#B89C6A] hover:text-[#B89C6A] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Carrossel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="flex-[0_0_45%] min-w-0 md:flex-[0_0_20%] pl-4"
            >
              <Link to={`/${shopType}/categoria/${cat.id}`} className="group block text-center">
                <div className="aspect-square overflow-hidden mb-4 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                  <img 
                    src={cat.image_url || "https://via.placeholder.com/400"} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 group-hover:text-[#B89C6A] block truncate">
                  {cat.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};