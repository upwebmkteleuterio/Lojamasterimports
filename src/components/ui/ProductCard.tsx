import React from 'react';
import { Product } from '@/types/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-2xl">
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => navigate(`/produto/${product.id}`)}
      >
        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <Button variant="secondary" size="sm" className="rounded-full shadow-lg gap-2 scale-90 group-hover:scale-100 transition-transform">
             <Eye size={16} /> Ver Detalhes
           </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] mb-2">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          className="w-full rounded-full bg-primary hover:bg-primary/90 text-white gap-2"
        >
          <ShoppingCart size={16} />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};