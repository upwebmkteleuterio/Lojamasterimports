"use client";

import React from 'react';
import { Product } from '@/types/store';
import { Link, useParams } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { shopType } = useParams<{ shopType: string }>();
  const currentShop = shopType || product.categoryMother || 'feminine';

  const price = product.promotionalPrice && product.promotionalPrice > 0 
    ? product.promotionalPrice 
    : product.price;

  return (
    <Link to={`/${currentShop}/produto/${product.id}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden bg-gray-50 rounded-2xl mb-4 relative">
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.promotionalPrice && product.promotionalPrice > 0 && (
          <div className="absolute top-4 left-4 bg-[#B89C6A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Oferta
          </div>
        )}
      </div>
      <div className="space-y-1 px-1">
        <h3 className="font-serif text-sm text-gray-800 group-hover:text-[#B89C6A] transition-colors truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
          </span>
          {product.promotionalPrice && product.promotionalPrice > 0 && (
            <span className="text-[10px] text-gray-400 line-through">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};