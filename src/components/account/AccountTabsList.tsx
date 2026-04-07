import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, User, Heart } from 'lucide-react';

interface AccountTabsListProps {
  ordersCount: number;
  favoritesCount: number;
}

export const AccountTabsList = ({ ordersCount, favoritesCount }: AccountTabsListProps) => {
  return (
    <div className="flex justify-center md:justify-start mb-8 overflow-x-auto no-scrollbar pb-2">
      <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 h-auto gap-1">
        <TabsTrigger 
          value="pedidos" 
          className="rounded-xl px-4 md:px-8 py-3 data-[state=active]:bg-[#B89C6A] data-[state=active]:text-white flex items-center gap-2 transition-all"
        >
          <Package size={18} />
          <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">Pedidos</span>
          {ordersCount > 0 && (
             <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
               {ordersCount}
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
          {favoritesCount > 0 && (
             <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
               {favoritesCount}
             </span>
          )}
        </TabsTrigger>
      </TabsList>
    </div>
  );
};