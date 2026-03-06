"use client";

import React, { useEffect, useState } from 'react';
import { Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsByMother } from '@/services/products';

interface RelatedProductsProps {
  currentProductId: string;
  categoryMother: 'pet' | 'feminine' | string;
}

export const RelatedProducts = ({ currentProductId, categoryMother }: RelatedProductsProps) => {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const allRelated = await getProductsByMother(categoryMother as any);
        const filtered = allRelated
          .filter(p => p.id !== currentProductId)
          .slice(0, 4);
        setRelated(filtered);
      } catch (error) {
        console.error("Erro ao buscar produtos relacionados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryMother) {
      fetchRelated();
    }
  }, [currentProductId, categoryMother]);

  if (loading || related.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white border-t border-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-serif text-gray-800 mb-8 md:mb-12 text-center md:text-left">
          Veja também
        </h2>
        
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-8 md:pb-0">
          {related.map(product => (
            <div 
              key={product.id} 
              className="w-[calc(50%-0.5rem)] min-w-[calc(50%-0.5rem)] md:w-full md:min-w-0 flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};