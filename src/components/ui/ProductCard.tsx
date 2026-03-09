"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/store';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Button } from '@/components/ui/button';

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
    <div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[2.5rem] border border-gray-100">
      {/* Badge de Desconto */}
      {hasDiscount && (
        <div className="absolute top-5 left-5 z-10">
          <span className="bg-[#B89C6A] text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
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
          "absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border border-gray-50",
          favorite 
            ? "bg-[#B89C6A] text-white border-none" 
            : "bg-white/90 text-gray-400 hover:text-[#B89C6A] hover:bg-white"
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
      </Link>

      {/* Informações */}
      <div className="p-6 flex flex-col items-center text-center">
        <Link to={`/${product.categoryMother}/produto/${product.id}`} className="block mb-3">
          <h3 className="text-sm font-serif text-gray-800 hover:text-[#B89C6A] transition-colors line-clamp-2 min-h-[40px] leading-relaxed px-2">
            {product.name}
          </h3>
        </Link>

        {/* Preços */}
        <div className="flex flex-col items-center gap-1 mb-6">
          {hasDiscount ? (
            <>
              <span className="text-[10px] text-gray-300 line-through font-light uppercase tracking-widest">
                De {formatPrice(product.price)}
              </span>
              <span className="text-xl font-bold text-[#B89C6A]">
                {formatPrice(product.promotionalPrice!)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Botão de Ação - Sempre Visível */}
        <Link to={`/${product.categoryMother}/produto/${product.id}`} className="w-full">
          <Button 
            className="w-full bg-gray-900 hover:bg-[#B89C6A] text-white rounded-2xl h-12 text-[10px] font-bold uppercase tracking-[0.2em] transition-all group-hover:shadow-lg"
          >
            <ShoppingBag size={14} className="mr-2" /> Comprar
          </Button>
        </Link>
      </div>
    </div>
  );
};