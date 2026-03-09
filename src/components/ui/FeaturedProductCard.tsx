"use client";

import React from 'react';
import { Product } from '@/types/store';
import { Link, useParams } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';
import { ShoppingBag, Eye } from 'lucide-react';

interface FeaturedProductCardProps {
  product: Product;
}

export const FeaturedProductCard = ({ product }: FeaturedProductCardProps) => {
  const { shopType } = useParams<{ shopType: string }>();
  const currentShop = shopType || product.categoryMother;

  const hasPromo = product.promotionalPrice && product.promotionalPrice > 0;
  const displayPrice = hasPromo ? product.promotionalPrice : product.price;

  return (
    <div className="group animate-in fade-in duration-700">
      <Link to={`/${currentShop}/produto/${product.id}`} className="block">
        {/* Imagem em formato mais horizontal para encaixar no grid lateral */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 border border-gray-100 mb-3 rounded-sm">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {hasPromo && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest z-10">
              OFF
            </div>
          )}

          {/* Overlay Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-2 backdrop-blur-[1px]">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center gap-2 w-full px-4">
              <button className="bg-white text-black w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#B89C6A] hover:text-white transition-colors">
                <ShoppingBag size={12} /> Comprar
              </button>
            </div>
          </div>
        </div>

        {/* Informações Extremamente Compactas */}
        <div className="space-y-0.5 px-1">
          <h4 className="text-[9px] md:text-[10px] font-serif text-gray-500 uppercase tracking-widest truncate group-hover:text-[#B89C6A] transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[11px] md:text-xs font-bold text-[#333]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
            </span>
            {hasPromo && (
              <span className="text-[8px] text-gray-300 line-through font-light">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};