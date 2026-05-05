import React from 'react';
import { getSafeProductImage } from '@/utils/imageHandler';

interface CheckoutSummaryProps {
  cart: any[];
  total: number;
}

export const CheckoutSummary = ({ cart, total }: CheckoutSummaryProps) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <aside className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm h-fit sticky top-24">
      <h2 className="text-xl font-serif font-bold text-gray-900 mb-8">Resumo da Compra</h2>
      
      <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border overflow-hidden flex-shrink-0">
              <img src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1">{item.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} unidade(s)</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-6 border-t border-dashed">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-medium">Subtotal</span>
          <span className="font-bold text-gray-700">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-medium">Frete</span>
          <span className="text-green-600 font-bold uppercase text-xs">Grátis</span>
        </div>
        <div className="flex justify-between items-end pt-4">
          <span className="text-lg font-serif font-bold text-gray-900 leading-none">Total</span>
          <span className="text-3xl font-bold text-[#B89C6A] leading-none">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
           <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
           <span className="text-[10px] font-bold uppercase tracking-widest">Entrega Grátis para todo Brasil</span>
        </div>
      </div>
    </aside>
  );
};