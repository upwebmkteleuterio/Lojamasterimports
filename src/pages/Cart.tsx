"use client";

import React from 'react';
import { useCartPage } from '@/hooks/useCartPage';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    loading, 
    handleCheckout, 
    handleContinueShopping 
  } = useCartPage();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-full mb-6 border border-gray-100 shadow-sm">
          <ShoppingCart size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nada.</p>
        <Button onClick={handleContinueShopping} className="rounded-full px-8 bg-black text-white hover:bg-zinc-800">
          Começar a Comprar
        </Button>
      </div>
    );
  }

  return (
    <main className="py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <CartItem 
              key={item.id} 
              item={item} 
              onUpdateQuantity={updateQuantity} 
              onRemove={removeFromCart} 
            />
          ))}

          <button 
            onClick={handleContinueShopping} 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#B89C6A] transition-colors mt-8"
          >
            <ArrowLeft size={16} /> Continuar comprando
          </button>
        </div>

        <CartSummary total={cartTotal} onCheckout={handleCheckout} />
      </div>
    </main>
  );
};

export default Cart;