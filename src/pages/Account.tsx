import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalDataForm } from '@/components/account/PersonalDataForm';
import { FavoriteItem } from '@/components/account/FavoriteItem';
import { useFavorites } from '@/context/FavoritesContext';
import { getOrders } from '@/services/persistence';
import { Order } from '@/types/store';
import { Badge } from '@/components/ui/badge';
import { Package, User, Heart, Calendar, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account = () => {
  const { favorites } = useFavorites();
  const orders = getOrders() as Order[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Minha Conta</h1>
          <p className="text-gray-500">Gerencie seus pedidos, dados pessoais e favoritos.</p>
        </header>

        <Tabs defaultValue="pedidos" className="w-full">
          <div className="flex justify-center md:justify-start mb-8 overflow-x-auto no-scrollbar pb-2">
            <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 h-auto gap-1">
              <TabsTrigger 
                value="pedidos" 
                className="rounded-xl px-4 md:px-8 py-3 data-[state=active]:bg-[#B89C6A] data-[state=active]:text-white flex items-center gap-2 transition-all"
              >
                <Package size={18} />
                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Pedidos</span>
                {orders.length > 0 && (
                   <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                     {orders.length}
                   </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="dados" 
                className="rounded-xl px-4 md:px-8 py-3 data-[state=active]:bg-[#B89C6A] data-[state=active]:text-white flex items-center gap-2 transition-all"
              >
                <User size={18} />
                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Meus Dados</span>
              </TabsTrigger>
              <TabsTrigger 
                value="favoritos" 
                className="rounded-xl px-4 md:px-8 py-3 data-[state=active]:bg-[#B89C6A] data-[state=active]:text-white flex items-center gap-2 transition-all"
              >
                <Heart size={18} />
                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Favoritos</span>
                {favorites.length > 0 && (
                   <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                     {favorites.length}
                   </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Pedidos */}
          <TabsContent value="pedidos" className="space-y-6 focus-visible:outline-none">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-8 bg-gray-50/50 border-b flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B89C6A]/10 text-[#B89C6A] flex items-center justify-center">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Pedido #{order.id}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full px-3">
                          {order.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-bold text-[#B89C6A]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag size={18} className="text-[#B89C6A]" /> Itens
                    </h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} unidade(s)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-[#B89C6A]" /> Entrega
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <p className="font-bold text-gray-900">{order.customerData.fullName}</p>
                      <p className="leading-relaxed">
                        {order.customerData.address}, {order.customerData.number}<br />
                        {order.customerData.city} - {order.customerData.state}<br />
                        CEP: {order.customerData.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Nenhum pedido ainda</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Você ainda não realizou compras em nossa loja.</p>
                <Link to="/">
                  <Badge variant="outline" className="px-6 py-2 border-[#B89C6A] text-[#B89C6A] cursor-pointer hover:bg-[#B89C6A] hover:text-white transition-colors">
                    Começar a Comprar
                  </Badge>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Dados Pessoais */}
          <TabsContent value="dados" className="focus-visible:outline-none">
            <div className="max-w-4xl mx-auto">
              <PersonalDataForm />
            </div>
          </TabsContent>

          {/* Favoritos */}
          <TabsContent value="favoritos" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
              {favorites.map((product) => (
                <FavoriteItem key={product.id} product={product} />
              ))}

              {favorites.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Sua lista está vazia</h3>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto">Salve seus produtos favoritos para vê-los aqui mais tarde.</p>
                  <Link to="/">
                    <Badge variant="outline" className="px-6 py-2 border-[#B89C6A] text-[#B89C6A] cursor-pointer hover:bg-[#B89C6A] hover:text-white transition-colors">
                      Ver Produtos
                    </Badge>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;
