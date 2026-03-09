"use client";

import React from 'react';
import { Product } from '@/types/store';
import { Link, useParams } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { shopType } = useParams<{ shopType: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentShop = shopType || 'feminine';

  const isFav = isFavorite(product.id);

  return (
    <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6 bg-gray-50 rounded-2xl">
        <Link to={`/${currentShop}/produto/${product.id}`} className="block w-full h-full">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </Link>
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          className={cn(
            "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 backdrop-blur-sm shadow-sm",
            isFav ? "text-red-500" : "text-gray-400 hover:text-red-500"
          )}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      
      <Link to={`/${currentShop}/produto/${product.id}`} className="space-y-1 md:space-y-2 block text-center md:text-left px-1">
        <h3 className="text-[11px] md:text-sm font-serif text-gray-800 line-clamp-1 group-hover:text-[#B89C6A] transition-colors">{product.name}</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-2 justify-center md:justify-start">
          <span className="text-sm md:text-lg font-bold text-[#B89C6A]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotionalPrice || product.price)}
          </span>
          {product.promotionalPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through font-light">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};