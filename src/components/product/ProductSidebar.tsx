"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Truck } from 'lucide-react';
import { Product } from '@/types/store';

interface ProductSidebarProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export const ProductSidebar = ({ product, onAddToCart }: ProductSidebarProps) => {
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("13 : 16 : 57");

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

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-5xl font-serif font-light text-[#333] mb-6 leading-tight">
        {product.name}
      </h1>

      <div className="mb-8">
        <span className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </span>
      </div>

      {/* Ações: Qtd + Comprar (Sempre lado a lado) */}
      <div className="flex items-center gap-3 md:gap-4 mb-10">
        <div className="flex items-center border border-gray-200 h-14 bg-white min-w-[120px] md:min-w-[140px]">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="flex-1 flex items-center justify-center h-full text-gray-400 hover:text-black transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-serif text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="flex-1 flex items-center justify-center h-full text-gray-400 hover:text-black transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <Button 
          onClick={() => onAddToCart(quantity)}
          className="flex-1 h-14 rounded-none bg-[#D4AF37] hover:bg-[#b8962d] text-white font-bold text-sm md:text-lg tracking-widest"
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
  );
};