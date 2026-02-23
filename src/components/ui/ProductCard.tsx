import React from 'react';
import { Product } from '@/types/store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  return (
    <div className="group flex flex-col items-center text-center">
      <div 
        className="relative w-full aspect-[4/5] bg-[#fafafa] overflow-hidden cursor-pointer mb-6"
        onClick={() => navigate(`/produto/${product.id}`)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2">
           <span className="bg-[#B89C6A] text-white text-[9px] px-2 py-0.5 font-bold">-1%</span>
        </div>
        {/* Overlay do botão no Hover */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-full rounded-none bg-white text-black hover:bg-black hover:text-white border-none shadow-xl text-[10px] font-bold tracking-[0.2em] py-6"
          >
            COMPRAR
          </Button>
        </div>
      </div>
      
      <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-1 line-clamp-1">
        {product.name}
      </h3>
      <div className="space-y-1">
        <p className="text-[10px] text-gray-400 line-through">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price * 1.05)}
        </p>
        <p className="text-sm font-bold text-gray-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
        <p className="text-[9px] text-gray-400 font-medium">
          10x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 10)} sem juros
        </p>
      </div>
    </div>
  );
};