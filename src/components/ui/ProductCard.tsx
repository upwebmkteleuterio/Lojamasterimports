"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductVariant } from '@/types/store';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { ShoppingBag, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafeProductImage } from '@/utils/imageHandler';
import { VariationSelectionModal } from '@/components/product/VariationSelectionModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Se tiver variações, abre o modal. Se não, adiciona direto.
    if (product.variants && product.variants.length > 0) {
      setIsModalOpen(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const hasPromo = product.promotionalPrice && product.promotionalPrice > 0;

  return (
    <>
      <Link 
        to={`/${product.categoryMother}/produto/${product.id}`}
        className="group block bg-white"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4 md:mb-6">
          <img 
            src={getSafeProductImage(product.image)} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Badge de Promoção */}
          {hasPromo && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest">
              Oferta
            </div>
          )}

          {/* Botão de Favorito */}
          <button 
            onClick={handleFavorite}
            className={cn(
              "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white shadow-sm hover:scale-110 active:scale-95",
              isFavorite(product.id) ? "text-red-500" : "text-gray-400"
            )}
          >
            <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>

          {/* Botão Quick Add no Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/20 to-transparent hidden md:block">
            <button 
              onClick={handleBuy}
              className="w-full bg-white text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Adicionar
            </button>
          </div>
        </div>

        <div className="space-y-1 text-center md:text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B89C6A] mb-1">
            {product.subcategory || 'Luxury'}
          </p>
          <h3 className="text-sm md:text-base font-serif font-light text-gray-800 leading-tight group-hover:text-[#B89C6A] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-1 md:gap-3 mt-2">
            <span className="text-sm md:text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(hasPromo ? product.promotionalPrice! : product.price)}
            </span>
            {hasPromo && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through font-light mb-0.5">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Modal de seleção rápida caso tenha variações */}
      <VariationSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onConfirm={(variant) => {
          addToCart(product, 1);
        }}
      />
    </>
  );
};