"use client";

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
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

  return (
    <div className="group relative flex flex-col h-full bg-white transition-all duration-500">
      {/* Imagem do Produto */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100 mb-4 md:mb-6">
        <Link to={`/${currentShop}/produto/${product.id}`} className="block w-full h-full">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {/* Badges e Botões Flutuantes */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button 
            onClick={() => toggleFavorite(product)}
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-300",
              isFavorite(product.id) 
                ? "bg-red-50 text-red-500" 
                : "bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-white hover:text-red-500"
            )}
          >
            <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {hasPromo && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#B89C6A] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none shadow-lg">
              Oferta
            </span>
          </div>
        )}

        {/* Quick Add - Desktop Only */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/40 backdrop-blur-sm hidden md:block">
          <button 
            onClick={() => addToCart(product, 1)}
            className="w-full bg-white text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#B89C6A] hover:text-white transition-colors"
          >
            ADICIONAR AO CARRINHO
          </button>
        </div>
      </div>

      {/* Informações do Produto */}
      <div className="flex flex-col flex-1 px-1">
        <Link to={`/${currentShop}/produto/${product.id}`} className="mb-2">
          <h3 className="text-[11px] md:text-sm font-serif font-light text-gray-800 line-clamp-2 hover:text-[#B89C6A] transition-colors uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto space-y-0.5 min-h-[48px] flex flex-col justify-end">
          {/* Preço Original (Apenas se houver promo, senão mantém espaço vazio para padronização) */}
          <div className="h-4">
            {hasPromo && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through font-light">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            )}
          </div>

          {/* Preço de Exibição */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-lg font-bold text-[#B89C6A]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
            </span>
          </div>
        </div>

        {/* Botão comprar Mobile */}
        <button 
          onClick={() => addToCart(product, 1)}
          className="md:hidden mt-4 flex items-center justify-center gap-2 w-full border border-gray-100 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-600 active:bg-gray-50 transition-colors"
        >
          <ShoppingBag size={12} /> Comprar
        </button>
      </div>
    </div>
  );
};