import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsBySubcategory } from '@/services/products';
import { CategoryMother, Product } from '@/types/store';
import { SlidersHorizontal, X } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const Category = () => {
  const { shopType, subId } = useParams<{ shopType: string, subId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  
  const motherCategory = (shopType || 'feminine') as CategoryMother;

  useEffect(() => {
    if (subId) {
      setProducts(getProductsBySubcategory(motherCategory, subId));
    }
    window.scrollTo(0, 0);
  }, [subId, motherCategory]);

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
      
      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Disponibilidade</h4>
        <label className="flex items-center gap-3 text-[11px] text-gray-500 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" />
          <span>Apenas em estoque</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          
          {/* Sidebar - Apenas Desktop */}
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-8 border-b pb-4">
              Filtros <SlidersHorizontal size={14} />
            </div>
            <FilterContent />
          </aside>

          <div className="flex-1">
            {/* Cabeçalho de Categoria Reformulado */}
            <header className="mb-8 md:mb-12 flex items-end justify-between border-b pb-6 md:pb-8">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-serif font-light text-gray-900 capitalize leading-none">{subId}</h1>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  {products.length} itens encontrados
                </p>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                {/* Ordenação */}
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span className="hidden sm:inline">Ordenar:</span>
                  <select className="border-none bg-transparent text-black focus:ring-0 cursor-pointer p-0 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                    <option>Destaques</option>
                    <option>Menor Preço</option>
                    <option>Maior Preço</option>
                  </select>
                </div>

                {/* Filtro Mobile (Sheet) */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="flex items-center justify-center w-9 h-9 border border-gray-100 rounded-full text-gray-900 active:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={16} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <SheetHeader className="text-left mb-10">
                        <SheetTitle className="text-[12px] font-bold uppercase tracking-[0.2em]">Filtros</SheetTitle>
                      </SheetHeader>
                      <FilterContent />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </header>

            {/* Grid de Produtos - 2 colunas mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full py-20 md:py-32 text-center">
                  <p className="font-serif text-xl md:text-2xl text-gray-300 italic">Nenhum produto encontrado.</p>
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

export default Category;