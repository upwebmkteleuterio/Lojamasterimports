"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, CreditCard } from 'lucide-react';

interface CartSummaryProps {
  total: number;
  onCheckout: () => void;
}

export const CartSummary = ({ total, onCheckout }: CartSummaryProps) => {
  return (
    <aside className="lg:col-span-1">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
        <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-gray-400">Resumo do Pedido</h2>
        
        <div className="space-y-6 mb-10">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Frete</span>
            <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Grátis</span>
          </div>
          <div className="border-t border-dashed pt-6 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-[#B89C6A]">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </div>
        </div>

        <Button 
          onClick={onCheckout}
          className="w-full h-16 rounded-full bg-black hover:bg-gray-800 text-white text-lg font-bold shadow-2xl shadow-black/20"
        >
          Finalizar Compra
        </Button>
        
        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col items-center gap-4 text-center">
           <div className="flex gap-2">
             <div className="w-8 h-5 bg-gray-100 rounded"></div>
             <div className="w-8 h-5 bg-gray-100 rounded"></div>
             <div className="w-8 h-5 bg-gray-100 rounded"></div>
           </div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pagamento 100% seguro & Criptografado</p>
        </div>
      </div>
    </aside>
  );
};