import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsBySubcategory } from '@/services/products';
import { getStorageItem } from '@/services/persistence';
import { CategoryMother, Product } from '@/types/store';
import { ChevronRight, Filter } from 'lucide-react';

const Category = () => {
  const { subId } = useParams<{ subId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const motherCategory = getStorageItem<CategoryMother>('mother_category') || 'pet';

  useEffect(() => {
    if (subId) {
      setProducts(getProductsBySubcategory(motherCategory, subId));
    }
  }, [subId, motherCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/home" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="capitalize">{motherCategory}</span>
          <ChevronRight size={14} />
          <span className="text-primary font-medium capitalize">{subId}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Filtros (Placeholder) */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-900 mb-6">
                <Filter size={18} /> Filtros
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Preço</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary border-gray-300" /> Até R$ 50,00
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary border-gray-300" /> R$ 50 a R$ 150
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Produtos */}
          <div className="flex-1">
            <header className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-serif font-bold text-gray-900 capitalize">{subId}</h1>
              <p className="text-sm text-gray-500">{products.length} produtos encontrados</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400">Nenhum produto encontrado nesta subcategoria.</p>
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