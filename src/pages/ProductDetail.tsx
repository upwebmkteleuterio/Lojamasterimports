import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { getProductById } from '@/services/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : null;
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-serif mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate('/home')}>Voltar para a Loja</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // A lógica de integração com o estado do carrinho será na Etapa 5
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbs - Simulação */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-all bg-gray-50">
                  <img src={product.image} className="w-full h-full object-cover opacity-50 hover:opacity-100" alt="View" />
                </div>
              ))}
            </div>
          </div>

          {/* Informações da Compra */}
          <div className="flex flex-col">
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none capitalize">
                  {product.subcategory}
                </Badge>
                {product.stock > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">Em estoque</Badge>
                ) : (
                  <Badge variant="destructive">Esgotado</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </span>
                <span className="text-gray-400 line-through text-lg">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price * 1.2)}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Ações */}
            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 gap-6 bg-gray-50">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                    className="text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 hover:text-red-500 transition-colors">
                  <Heart size={20} />
                </Button>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 h-14 rounded-full text-lg font-bold gap-3 shadow-xl shadow-primary/20"
                >
                  <ShoppingCart size={22} />
                  Adicionar ao Carrinho
                </Button>
              </div>

              {/* Benefícios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Truck size={18} className="text-primary" />
                  Frete grátis acima de R$ 250
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <RotateCcw size={18} className="text-primary" />
                  Devolução grátis em 7 dias
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <ShieldCheck size={18} className="text-primary" />
                  Garantia Diamond de 1 ano
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;