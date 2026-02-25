"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/types/store';
import { Button } from '@/components/ui/button';
import { getSafeProductImage } from '@/utils/imageHandler';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  // Simulação de preço original para o efeito visual da imagem
  const originalPrice = product.price * 1.1;
  const installments = 10;
  const installmentValue = product.price / installments;

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
        {/* Badge de Desconto (Simulado) */}
        <div className="absolute top-0 right-0 bg-[#E5B343] text-white text-[10px] font-bold px-3 py-1">
          -10%
        </div>
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
          <span className="text-[10px] md:text-xs text-gray-400 line-through">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
          </span>
          <span className="font-bold text-sm md:text-lg text-[#1A365D]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          <span className="text-[10px] md:text-xs text-gray-500 italic">
            {installments}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue)} sem juros
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