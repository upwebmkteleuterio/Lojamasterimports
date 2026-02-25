"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/context/FavoritesContext';
import { FavoriteItem } from './FavoriteItem';

export const FavoritesSection = () => {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Sua lista está vazia</h3>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Salve seus produtos favoritos para vê-los aqui mais tarde.</p>
        <Link to="/">
          <Badge variant="outline" className="px-6 py-2 border-[#B89C6A] text-[#B89C6A] cursor-pointer hover:bg-[#B89C6A] hover:text-white transition-colors">
            Ver Produtos
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
      {favorites.map((product) => (
        <FavoriteItem key={product.id} product={product} />
      ))}
    </div>
  );
};