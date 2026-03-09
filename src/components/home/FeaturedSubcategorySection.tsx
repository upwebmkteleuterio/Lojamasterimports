"use client";

import React, { useEffect, useState } from 'react';
import { Product, Subcategory } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Link } from 'react-router-dom';

interface FeaturedSubcategorySectionProps {
  subcategory: Subcategory;
  shopType: string;
}

const mapDbToProduct = (dbItem: any): Product => ({
  id: dbItem.id,
  name: dbItem.name,
  price: Number(dbItem.price),
  promotionalPrice: dbItem.promo_price ? Number(dbItem.promo_price) : undefined,
  image: dbItem.main_image || '',
  categoryMother: dbItem.category_mother_id,
  subcategory: dbItem.subcategory_id,
  description: dbItem.description || '',
  stock: dbItem.stock || 0,
  sku: dbItem.sku || '',
  active: dbItem.is_active
});

export const FeaturedSubcategorySection = ({ subcategory, shopType }: FeaturedSubcategorySectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Busca produtos da subcategoria específica
        // Para simular aleatoriedade, podemos usar um offset aleatório ou apenas pegar os primeiros
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('subcategory_id', subcategory.id.startsWith(`${shopType}-`) ? subcategory.id : `${shopType}-${subcategory.id}`)
          .eq('is_active', true)
          .limit(4);

        if (error) throw error;
        setProducts((data || []).map(mapDbToProduct));
      } catch (err) {
        console.error("Erro ao buscar produtos da subcategoria em destaque:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [subcategory.id, shopType]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-20 border-t border-gray-50 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Coluna Esquerda: Imagem e Chamada */}
          <div className="lg:col-span-5 relative group overflow-hidden">
            <Link to={`/${shopType}/categoria/${subcategory.id}`} className="block relative aspect-[4/5] overflow-hidden">
              <img 
                src={getSafeProductImage(subcategory.image_url)} 
                alt={subcategory.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl md:text-5xl font-serif mb-4 uppercase tracking-widest">{subcategory.name}</h3>
                <span className="inline-block border-b-2 border-white pb-1 text-xs font-bold uppercase tracking-widest">
                  Ver Coleção Completa
                </span>
              </div>
            </Link>
          </div>

          {/* Coluna Direita: Grade de 4 Produtos */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-x-6 gap-y-12">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-50 animate-pulse" />)
              ) : (
                products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};