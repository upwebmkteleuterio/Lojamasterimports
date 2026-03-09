"use client";

import React from 'react';
import { Product } from '@/types/store';
import { Link, useParams } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { shopType } = useParams<{ shopType: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const currentShop = shopType || 'feminine';

  const isFav = isFavorite(product.id);
  
  // Cálculo do percentual de desconto
  const hasPromo = product.promotionalPrice && product.promotionalPrice > 0 && product.promotionalPrice < product.price;
  const discountPercent = hasPromo 
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="group animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center w-full">
      {/* Container da Imagem - Forçado a ser Quadrado Perfeito */}
      <div className="relative w-full pt-[100%] overflow-hidden mb-6 bg-gray-50 rounded-none">
        <Link to={`/${currentShop}/produto/${product.id}`} className="absolute inset-0 w-full h-full">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        </Link>
        
        {/* Selo de Desconto */}
        {hasPromo && (
          <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-10">
            -{discountPercent}%
          </div>
        )}

        {/* Favorito */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product);
          }}
          className={cn(
            "absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 z-10",
            isFav ? "text-red-500 opacity-100" : "text-gray-400 hover:text-red-500"
          )}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      
      {/* Informações do Produto */}
      <Link to={`/${currentShop}/produto/${product.id}`} className="space-y-3 block text-center px-2 flex-1 w-full">
        <h3 className="text-sm md:text-base font-serif text-[#555] leading-relaxed h-12 flex items-center justify-center line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex flex-col items-center gap-1">
          {hasPromo && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through font-light">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </span>
          )}
          <span className="text-sm md:text-lg font-bold text-[#333]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotionalPrice || product.price)}
          </span>
        </div>
      </Link>

      {/* Botão Comprar */}
      <div className="mt-6 w-full max-w-[180px]">
        <Link to={`/${currentShop}/produto/${product.id}`}>
          <Button 
            variant="outline" 
            className="w-full rounded-none border-gray-900 text-gray-900 font-serif uppercase text-[10px] tracking-[0.2em] h-12 hover:bg-gray-900 hover:text-white transition-all"
          >
            COMPRAR
          </Button>
        </Link>
      </div>
    </div>
  );
};