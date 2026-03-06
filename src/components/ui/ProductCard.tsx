"use client";

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '@/types/store';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getSafeProductImage } from '@/utils/imageHandler';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { shopType } = useParams<{ shopType: string }>();
  
  const currentShop = shopType || product.categoryMother || 'feminine';
  const hasPromo = product.promotionalPrice && product.promotionalPrice > 0;
  const displayPrice = hasPromo ? product.promotionalPrice : product.price;

  // Cálculo da porcentagem de desconto
  const discountPercentage = hasPromo 
    ? Math.round(((product.price - (product.promotionalPrice || 0)) / product.price) * 100)
    : 0;

  return (
    <div className="group flex flex-col h-full bg-white transition-all duration-500">
      {/* Imagem do Produto */}
      <div className="relative aspect-square overflow-hidden bg-[#F7F7F7] mb-5">
        <Link to={`/${currentShop}/produto/${product.id}`} className="block w-full h-full">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Favoritar - Discreto no canto */}
        <button 
          onClick={() => toggleFavorite(product)}
          className={cn(
            "absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10",
            isFavorite(product.id) ? "text-red-500" : "text-gray-300 hover:text-red-500"
          )}
        >
          <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} />
        </button>

        {/* Badge de Desconto - Canto superior direito (Ocre) */}
        {hasPromo && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-[#E5B343] text-white text-[11px] font-bold px-3 py-1.5 flex items-center justify-center">
              -{discountPercentage}%
            </div>
          </div>
        )}
      </div>

      {/* Informações do Produto Centralizadas */}
      <div className="flex flex-col items-center text-center flex-1 px-2">
        <Link to={`/${currentShop}/produto/${product.id}`} className="mb-3">
          <h3 className="text-sm md:text-base font-serif text-[#705E1C] leading-tight hover:opacity-80 transition-opacity max-w-[200px]">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto mb-6 flex flex-col items-center">
          {/* Linha de Preços */}
          <div className="flex items-center justify-center gap-2">
            {hasPromo && (
              <span className="text-[11px] md:text-[13px] text-gray-400 line-through font-light">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            )}
            <span className="text-sm md:text-base font-bold text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
            </span>
          </div>
        </div>

        {/* Botão Comprar - Estilo Borda Fina Centralizado */}
        <div className="w-full flex justify-center pb-2">
          <button 
            onClick={() => addToCart(product, 1)}
            className="w-[160px] h-[45px] border border-gray-800 bg-white text-gray-800 text-[12px] font-serif uppercase tracking-[0.1em] hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            COMPRAR
          </button>
        </div>
      </div>
    </div>
  );
};