"use client";

import React from 'react';
import { Product } from '@/types/store';
import { Link, useParams } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';

interface FeaturedProductCardProps {
  product: Product;
}

export const FeaturedProductCard = ({ product }: FeaturedProductCardProps) => {
  const { shopType } = useParams<{ shopType: string }>();
  const currentShop = shopType || product.categoryMother || 'feminine';

  const price = product.promotionalPrice && product.promotionalPrice > 0 
    ? product.promotionalPrice 
    : product.price;

  return (
    <Link to={`/${currentShop}/produto/${product.id}`} className="group block">
      <div className="aspect-square overflow-hidden bg-gray-50 mb-6 relative shadow-sm">
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>
      <div className="text-center px-2">
        <h4 className="font-serif text-sm md:text-base text-gray-800 mb-2 uppercase tracking-wide group-hover:text-[#B89C6A] transition-colors truncate">
          {product.name}
        </h4>
        <p className="text-[#B89C6A] font-bold text-base md:text-lg">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
        </p>
      </div>
    </Link>
  );
};