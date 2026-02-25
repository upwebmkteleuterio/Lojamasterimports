import React from 'react';
import { Product } from '@/types/store';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSafeProductImage } from '@/utils/imageHandler';

interface FavoriteItemProps {
  product: Product;
}

export const FavoriteItem = ({ product }: FavoriteItemProps) => {
  const { toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/${product.categoryMother}/produto/${product.id}`);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Imagem */}
      <div 
        onClick={handleProductClick}
        className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
      >
        <img 
          src={getSafeProductImage(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Detalhes */}
      <div className="flex-1 min-w-0">
        <h3 
          onClick={handleProductClick}
          className="font-serif text-sm md:text-base text-gray-800 hover:text-[#B89C6A] transition-colors truncate cursor-pointer"
        >
          {product.name}
        </h3>
        <p className="text-[#B89C6A] font-bold text-sm md:text-lg mt-1">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col md:flex-row gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
          onClick={() => toggleFavorite(product)}
        >
          <Trash2 size={18} />
        </Button>
        <Button 
          size="sm"
          className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full px-4 text-xs font-bold uppercase tracking-wider"
          onClick={handleProductClick}
        >
          <ShoppingBag size={14} className="mr-2" /> Comprar
        </Button>
      </div>
    </div>
  );
};
