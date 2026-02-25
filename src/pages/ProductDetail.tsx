"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { getProductById } from '@/services/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getSafeProductImage } from '@/utils/imageHandler';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = id ? getProductById(id) : null;
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("13 : 16 : 57");

  // Simulação do contador
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(23 - now.getHours()).padStart(2, '0');
      const m = String(59 - now.getMinutes()).padStart(2, '0');
      const s = String(59 - now.getSeconds()).padStart(2, '0');
      setTimeLeft(`${h} : ${m} : ${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="aspect-square bg-white border border-gray-100 overflow-hidden">
              <img src={getSafeProductImage(product.image)} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square border border-gray-100 cursor-pointer bg-gray-50">
                  <img src={getSafeProductImage(product.image)} className="w-full h-full object-cover opacity-60" alt="Thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-serif font-light text-[#333] mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="mb-8">
              <span className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            </div>

            {/* Ações: Qtd + Comprar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-gray-200 h-14 bg-white">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-gray-400 hover:text-black transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center font-serif text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 h-full text-gray-400 hover:text-black transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="flex-1 h-14 rounded-none bg-[#D4AF37] hover:bg-[#b8962d] text-white font-bold text-lg tracking-widest"
              >
                COMPRAR
              </Button>
            </div>

            {/* Escassez Box */}
            <div className="border border-gray-100 p-8 text-center space-y-4 mb-10">
              <p className="font-serif text-[#333]">
                Apenas <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#333] text-white text-xs font-sans align-middle mx-1">9</span> produtos em estoque
              </p>
              
              <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#444] w-[30%]" />
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-500 font-serif mb-1">Oferta acaba em</p>
                <p className="text-3xl font-bold text-[#333] tracking-wider">{timeLeft}</p>
              </div>
            </div>

            {/* Simular Frete */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[#333] font-serif text-sm">
                <Truck size={18} />
                <span>Simular frete</span>
              </div>
              <div className="flex gap-2 max-w-sm">
                <Input placeholder="00000-000" className="rounded-none h-11 border-gray-200" />
                <Button variant="outline" className="rounded-none h-11 border-gray-200 px-6 font-serif uppercase text-xs tracking-widest">OK</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;