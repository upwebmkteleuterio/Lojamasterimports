"use client";

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Product } from '@/types/store';
import { getSafeProductImage } from '@/utils/imageHandler';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { shopType } = useParams<{ shopType: string }>();
  const currentShop = shopType || product.categoryMother;

  return (
    <div className="group flex flex-col h-full bg-white transition-all duration-300">
      <Link to={`/${currentShop}/produto/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-50 border border-gray-100">
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Botão de Compra Rápida - Escondido no mobile, aparece no hover desktop */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, 1);
          }}
          className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest py-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:flex items-center justify-center gap-2 hover:bg-black hover:text-white"
        >
          <ShoppingBag size={14} /> Adicionar
        </button>
      </Link>
      
      <div className="mt-3 md:mt-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link to={`/${currentShop}/produto/${product.id}`} className="flex-1">
            <h3 className="text-[10px] md:text-[11px] font-bold text-gray-900 uppercase tracking-widest line-clamp-2 min-h-[2.5em] group-hover:text-[#B89C6A] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-[11px] md:text-sm font-bold text-[#B89C6A]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </p>
          
          {/* Mobile Add Button - Visível apenas no mobile */}
          <button 
            onClick={() => addToCart(product, 1)}
            className="md:hidden w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 active:bg-gray-100 transition-colors"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};