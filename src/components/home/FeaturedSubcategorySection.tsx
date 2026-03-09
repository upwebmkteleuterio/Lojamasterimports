"use client";

import React, { useEffect, useState } from 'react';
import { Product, Subcategory } from '@/types/store';
import { FeaturedProductCard } from '@/components/ui/FeaturedProductCard';
import { supabase } from '@/integrations/supabase/client';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Link } from 'react-router-dom';
import { diamondDebug } from '@/utils/debug';

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
        // Busca os 4 produtos mais recentes/destacados desta subcategoria
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('subcategory_id', subcategory.id.startsWith(`${shopType}-`) ? subcategory.id : `${shopType}-${subcategory.id}`)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setProducts((data || []).map(mapDbToProduct));
        diamondDebug('success', `Carregados ${data?.length || 0} produtos para seção de destaque: ${subcategory.name}`);
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
    <section className="py-16 md:py-32 border-t border-gray-50 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda: Imagem de Campanha e Chamada */}
          <div className="lg:col-span-5 relative group overflow-hidden">
            <Link to={`/${shopType}/categoria/${subcategory.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl shadow-black/5">
              <img 
                src={getSafeProductImage(subcategory.image_url)} 
                alt={subcategory.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700" />
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                <h3 className="text-4xl md:text-6xl font-serif mb-6 uppercase tracking-[0.1em] leading-tight">
                  Coleção<br/>{subcategory.name}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-12 bg-white/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#B89C6A] transition-colors">
                    Explorar Agora
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Coluna Direita: Grade de Produtos com o Novo Layout Compacto */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-y-16">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-sm" />)
              ) : (
                products.map(product => (
                  <FeaturedProductCard key={product.id} product={product} />
                ))
              )}
            </div>
            
            <div className="mt-12 md:mt-20 text-center lg:text-right">
               <Link to={`/${shopType}/categoria/${subcategory.id}`} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-[#B89C6A] transition-colors border-b border-gray-100 pb-2">
                 Ver todos os itens desta coleção
               </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};