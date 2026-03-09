"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/store';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafeProductImage } from '@/utils/imageHandler';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const hasDiscount = product.promotionalPrice && product.promotionalPrice > 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100) 
    : 0;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] rounded-[2rem] border border-gray-50">
      {/* Badge de Desconto */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#B89C6A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {discountPercentage}% OFF
          </span>
        </div>
      )}

      {/* Botão de Favoritar */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product);
        }}
        className={cn(
          "absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md",
          favorite 
            ? "bg-[#B89C6A] text-white" 
            : "bg-white/80 text-gray-400 hover:text-[#B89C6A] hover:bg-white"
        )}
      >
        <Heart size={18} fill={favorite ? "currentColor" : "none"} strokeWidth={1.5} />
      </button>

      {/* Container da Imagem */}
      <Link to={`/${product.categoryMother}/produto/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-[#FDFDFD]">
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay de Ação Rápida */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="bg-white/90 backdrop-blur-sm py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-900 shadow-xl">
              <ShoppingBag size={14} /> Ver Detalhes
            </div>
          </div>
        </div>
      </Link>

      {/* Informações */}
      <div className="p-6 flex flex-col items-center text-center space-y-3">
        <Link to={`/${product.categoryMother}/produto/${product.id}`} className="block">
          <h3 className="text-sm font-serif text-gray-800 hover:text-[#B89C6A] transition-colors line-clamp-2 min-h-[40px] leading-relaxed">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col items-center gap-1">
          {hasDiscount ? (
            <>
              <span className="text-xs text-gray-300 line-through font-light">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg font-bold text-[#B89C6A]">
                {formatPrice(product.promotionalPrice!)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};