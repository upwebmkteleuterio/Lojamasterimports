import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsBySubcategory } from '@/services/products';
import { CategoryMother, Product } from '@/types/store';
import { ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb - Mais compacto no mobile */}
        <nav className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 mb-8 md:mb-12">
          <Link to={`/${shopType}`} className="hover:text-[#B89C6A] transition-colors font-bold">Home</Link>
          <ChevronRight size={10} />
          <span className="font-bold">{shopType}</span>
          <ChevronRight size={10} />
          <span className="text-[#B89C6A] font-bold">{subId}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          {/* Sidebar - Oculta no Mobile ou compactada */}
          <aside className="w-full lg:w-64 space-y-8 md:space-y-12">
            <div className="border-b pb-6 md:pb-8 flex items-center justify-between lg:block">
              <div className="flex items-center gap-2 font-bold text-[10px] md:text-[11px] uppercase tracking-widest text-gray-900 lg:mb-8">
                Filtros <SlidersHorizontal size={14} />
              </div>
              
              <div className="hidden lg:block space-y-10">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-4">Preço</h4>
                  <div className="space-y-3">
                    {['Até R$ 100', 'R$ 100 - R$ 500', 'R$ 500+'].map((range) => (
                      <label key={range} className="flex items-center gap-3 text-[11px] text-gray-500 cursor-pointer hover:text-black transition-colors group">
                        <input type="checkbox" className="w-3 h-3 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" />
                        <span className="group-hover:translate-x-1 transition-transform">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Produtos - 2 colunas no mobile */}
          <div className="flex-1">
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-baseline gap-4 border-b pb-6 md:pb-8">
              <div>
                <h1 className="text-2xl md:text-4xl font-serif font-light text-gray-900 capitalize mb-1 md:mb-2">{subId}</h1>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mostrando {products.length} itens encontrados</p>
              </div>
              <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Ordenar por: 
                <select className="border-none bg-transparent text-black focus:ring-0 cursor-pointer p-0">
                  <option>Destaques</option>
                  <option>Menor Preço</option>
                  <option>Maior Preço</option>
                </select>
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full py-20 md:py-32 text-center">
                  <p className="font-serif text-xl md:text-2xl text-gray-300 italic">Desculpe, não encontramos produtos nesta seleção.</p>
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