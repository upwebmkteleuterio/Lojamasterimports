import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { getStorageItem } from '@/services/persistence';
import { CategoryMother, Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Produto Exemplo 1',
    price: 129.90,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop',
    categoryMother: 'pet',
    subcategory: 'brinquedos',
    description: 'Descrição longa do produto pet.',
    stock: 10
  },
  {
    id: '2',
    name: 'Produto Exemplo 2',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1787&auto=format&fit=crop',
    categoryMother: 'feminine',
    subcategory: 'maquiagem',
    description: 'Descrição longa do produto feminino.',
    stock: 5
  }
];

const Index = () => {
  const [motherCategory, setMotherCategory] = useState<CategoryMother | null>(null);

  useEffect(() => {
    const saved = getStorageItem<CategoryMother>('mother_category');
    setMotherCategory(saved);
  }, []);

  const filteredProducts = MOCK_PRODUCTS.filter(p => p.categoryMother === motherCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Banner Principal Dinâmico */}
      <section className="relative h-[400px] w-full bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40">
           <img 
            src={motherCategory === 'pet' 
              ? "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1886&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
            }
            className="w-full h-full object-cover"
            alt="Hero"
           />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            {motherCategory === 'pet' ? 'Mundo Pet de Luxo' : 'Essenciais de Beleza'}
          </h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Descubra nossa curadoria exclusiva de produtos selecionados com o padrão Diamond.
          </p>
        </div>
      </section>

      {/* Lista de Produtos (Grade) */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Destaques</h2>
            <p className="text-gray-500">Os mais amados da semana</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-500">
                Nenhum produto cadastrado para esta categoria ainda.
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;