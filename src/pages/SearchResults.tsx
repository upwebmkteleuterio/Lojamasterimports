"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { searchProducts } from '@/services/products';
import { CategoryMother, Product } from '@/types/store';
import { SlidersHorizontal, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const SearchResults = () => {
  const { shopType } = useParams<{ shopType: string }>();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  
  const query = searchParams.get('q') || '';
  const motherCategory = (shopType || 'feminine') as CategoryMother;

  useEffect(() => {
    setProducts(searchProducts(motherCategory, query));
  }, [query, motherCategory]);

  const FilterContent = () => (
    <div className="space-y-10">
      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Preço</h4>
        <div className="space-y-4">
          {['Até R$ 100', 'R$ 100 - R$ 500', 'R$ 500+'].map((range) => (
            <label key={range} className="flex items-center gap-3 text-[11px] text-gray-500 cursor-pointer hover:text-black transition-colors group">
              <input type="checkbox" className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" />
              <span className="group-hover:translate-x-1 transition-transform">{range}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-8 border-b pb-4">
              Filtros <SlidersHorizontal size={14} />
            </div>
            <FilterContent />
          </aside>

          <div className="flex-1">
            <header className="mb-8 md:mb-12 flex items-end justify-between border-b pb-6 md:pb-8">
              <div className="space-y-1">
                <h1 className="text-xl md:text-3xl font-serif font-light text-gray-900 leading-none">
                  Resultados para: <span className="text-[#B89C6A] italic">"{query}"</span>
                </h1>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  {products.length} itens encontrados em {motherCategory === 'pet' ? 'Pet Shop' : 'Luxury Shop'}
                </p>
              </div>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 border border-gray-100 rounded-full text-gray-900 active:bg-gray-50 transition-colors">
                      <SlidersHorizontal size={16} />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader className="text-left mb-10">
                      <SheetTitle className="text-[12px] font-bold uppercase tracking-[0.2em]">Filtros</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full py-20 md:py-32 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Search size={32} />
                  </div>
                  <p className="font-serif text-xl md:text-2xl text-gray-400 italic">Nenhum produto encontrado para sua busca.</p>
                  <Link to={`/${shopType}`} className="inline-block mt-6 md:mt-8 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1">
                    Voltar para a Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;