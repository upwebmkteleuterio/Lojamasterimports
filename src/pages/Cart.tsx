import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-full mb-6">
            <ShoppingCart size={64} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nada.</p>
          <Button onClick={() => navigate('/home')} className="rounded-full px-8">
            Começar a Comprar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">Meu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center shadow-sm border border-gray-100">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{item.subcategory}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="flex items-center border border-gray-100 rounded-full px-3 py-1 gap-4 bg-gray-50">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/home" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mt-4">
              <ArrowLeft size={16} /> Continuar comprando
            </Link>
          </div>

          {/* Resumo */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/checkout')}
                className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
              >
                Finalizar Compra
              </Button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Taxas e frete calculados no checkout
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cart;