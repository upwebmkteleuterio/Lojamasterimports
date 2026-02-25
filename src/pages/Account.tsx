"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalDataForm } from '@/components/account/PersonalDataForm';
import { OrdersSection } from '@/components/account/OrdersSection';
import { FavoritesSection } from '@/components/account/FavoritesSection';
import { useFavorites } from '@/context/FavoritesContext';
import { getOrders } from '@/services/persistence';
import { Package, User, Heart } from 'lucide-react';

const Account = () => {
  const { favorites } = useFavorites();
  const orders = getOrders();

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
                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Dados</span>
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

          <TabsContent value="pedidos" className="focus-visible:outline-none">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="dados" className="focus-visible:outline-none">
            <div className="max-w-4xl mx-auto">
              <PersonalDataForm />
            </div>
          </TabsContent>

          <TabsContent value="favoritos" className="focus-visible:outline-none">
            <FavoritesSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;