import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingCart, Tag } from 'lucide-react';
import { getSafeProductImage } from '@/utils/imageHandler';

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
          <Button onClick={() => navigate('/feminine')} className="rounded-full px-8">
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
              <div key={item.id} className="bg-white p-6 rounded-3xl flex gap-6 items-center shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4">
                {/* Imagem Inteligente: Prioriza a da variação */}
                <div className="w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
                  <img 
                    src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-2">
                  <div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900 truncate">{item.name}</h3>
                    
                    {/* Exibição da Variação Selecionada */}
                    {item.selectedVariant && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest">
                          <Tag size={10} className="text-[#B89C6A]" /> {item.selectedVariant.attribute_name}: {item.selectedVariant.option_name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Unitário</span>
                       <span className="font-bold text-[#B89C6A] text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <div className="flex items-center border border-gray-100 rounded-2xl px-4 py-2 gap-6 bg-gray-50 shadow-inner">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-400 hover:text-black transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-black transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#B89C6A] transition-colors mt-8">
              <ArrowLeft size={16} /> Continuar comprando
            </Link>
          </div>

          {/* Resumo */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-gray-400">Resumo do Pedido</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Frete</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Grátis</span>
                </div>
                <div className="border-t border-dashed pt-6 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-[#B89C6A]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/checkout')}
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
        </div>
      </main>
    </div>
  );
};

export default Cart;