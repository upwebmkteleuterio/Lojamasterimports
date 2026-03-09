"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/store';
import { useFavorites } from '@/context/FavoritesContext';
import { Heart } from 'lucide-react';
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
    <div className="group relative flex flex-col bg-white transition-all duration-300 border border-transparent hover:border-gray-100">
      {/* Badge de Desconto à direita conforme anexo */}
      {hasDiscount && (
        <div className="absolute top-0 right-0 z-10">
          <span className="bg-[#E5B343] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
            -{discountPercentage}%
          </span>
        </div>
      )}

      {/* Botão de Favoritar discreto */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product);
        }}
        className="absolute top-2 left-2 z-10 text-gray-300 hover:text-[#B89C6A] transition-colors"
      >
        <Heart size={16} fill={favorite ? "#B89C6A" : "none"} color={favorite ? "#B89C6A" : "currentColor"} />
      </button>

      {/* Imagem Quadrada (Sem arredondamento) */}
      <Link to={`/${product.categoryMother}/produto/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#FDFDFD]">
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>

      {/* Informações Centralizadas */}
      <div className="py-6 flex flex-col items-center text-center space-y-3 px-2">
        <Link to={`/${product.categoryMother}/produto/${product.id}`} className="block">
          <h3 className="text-sm font-serif text-[#745e2a] line-clamp-2 min-h-[40px] leading-snug px-2">
            {product.name}
          </h3>
        </Link>

        {/* Preços no estilo do anexo */}
        <div className="flex flex-col items-center">
          {hasDiscount ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gray-400 font-light">
                {formatPrice(product.price)} <span className="font-bold text-gray-800 ml-1">{formatPrice(product.promotionalPrice!)}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-800">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Botão COMPRAR - Estilo Anexo (Quadrado, Borda Preta) */}
        <Link to={`/${product.categoryMother}/produto/${product.id}`} className="w-full max-w-[140px] pt-2">
          <Button 
            className="w-full bg-white hover:bg-black hover:text-white text-black border border-black rounded-none h-10 text-[11px] font-serif uppercase tracking-widest transition-all"
          >
            COMPRAR
          </Button>
        </Link>
      </div>
    </div>
  );
};