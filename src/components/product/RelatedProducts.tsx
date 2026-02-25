"use client";

import React from 'react';
import { Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsByMother } from '@/services/products';

interface RelatedProductsProps {
  currentProductId: string;
  categoryMother: 'pet' | 'feminine';
}

export const RelatedProducts = ({ currentProductId, categoryMother }: RelatedProductsProps) => {
  // Busca produtos da mesma categoria mãe, excluindo o atual
  const allRelated = getProductsByMother(categoryMother);
  const related = allRelated
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-serif text-gray-800 mb-8 md:mb-12 text-center md:text-left">
          Veja também
        </h2>
        
        {/* Container Responsivo: Flex com scroll no mobile, Grid no PC */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-8 md:pb-0">
          {related.map(product => (
            <div key={product.id} className="min-w-[200px] md:min-w-0 flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};