"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/store';
import { Button } from '@/components/ui/button';
import { getSafeProductImage } from '@/utils/imageHandler';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/${product.categoryMother}/produto/${product.id}`);
  };

  return (
    <div className="group flex flex-col items-center bg-white">
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