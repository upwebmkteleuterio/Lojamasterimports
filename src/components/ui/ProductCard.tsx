"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/store';
import { Button } from '@/components/ui/button';
import { getSafeProductImage } from '@/utils/imageHandler';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(product.id);

  const handleProductClick = () => {
    navigate(`/${product.categoryMother}/produto/${product.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <div className="group flex flex-col items-center bg-white relative">
      {/* Imagem do Produto */}
      <div
        onClick={handleProductClick}
        className="relative w-full aspect-square overflow-hidden cursor-pointer mb-4"
      >
        <img
          src={getSafeProductImage(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Heart Toggle */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full shadow-md transition-all duration-300",
            active
              ? "bg-[#B89C6A] text-white scale-110"
              : "bg-white/80 text-gray-400 hover:text-[#B89C6A] hover:bg-white"
          )}
        >
          <Heart size={16} fill={active ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Informações do Produto */}
      <div className="flex flex-col items-center text-center px-2 space-y-1">
        <h3 
          onClick={handleProductClick}
          className="font-serif text-sm md:text-base text-[#444] leading-tight cursor-pointer hover:text-[#B89C6A] transition-colors line-clamp-2 min-h-[2.5rem]"
        >
          {product.name}
        </h3>

        <div className="flex flex-col items-center gap-0.5 mt-2">
          <span className="font-bold text-sm md:text-lg text-[#1A365D]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
        </div>

        {/* Botão Comprar */}
        <div className="pt-4 w-full max-w-[160px]">
          <Button 
            onClick={handleProductClick}
            variant="outline"
            className="w-full rounded-none border-[#444] text-[#1A365D] font-serif uppercase text-[10px] md:text-xs tracking-widest hover:bg-[#444] hover:text-white transition-all py-6"
          >
            COMPRAR
          </Button>
        </div>
      </div>
    </div>
  );
};