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
        {/* Container da Imagem com Overlay */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 border border-gray-100 mb-4 rounded-sm">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Badge de Promoção */}
          {hasPromo && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest z-10">
              OFF
            </div>
          )}

          {/* Overlay que aparece no Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center gap-3 w-full px-6">
              <button className="bg-white text-black w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#B89C6A] hover:text-white transition-colors">
                <ShoppingBag size={14} /> Comprar Agora
              </button>
              <span className="text-white text-[9px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                <Eye size={12} /> Ver Detalhes
              </span>
            </div>
          </div>
        </div>

        {/* Informações Compactas Abaixo */}
        <div className="space-y-1">
          <h4 className="text-[10px] md:text-xs font-serif text-gray-800 uppercase tracking-widest truncate group-hover:text-[#B89C6A] transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center gap-2">
            {hasPromo && (
              <span className="text-[9px] text-gray-400 line-through font-light">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            )}
            <span className="text-xs md:text-sm font-bold text-[#333]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};