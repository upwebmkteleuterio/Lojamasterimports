"use client";

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const { cartCount } = useCart();
  const { shopType } = useParams<{ shopType: string }>();
  
  const currentShop = shopType || 'feminine';

  const menuItems = currentShop === 'pet' 
    ? [
        { id: 'conforto', name: 'Conforto' },
        { id: 'higiene', name: 'Higiene' },
        { id: 'brinquedos', name: 'Brinquedos' },
        { id: 'acessorios', name: 'Acessórios' },
        { id: 'saude', name: 'Saúde' }
      ]
    : [
        { id: 'acessorios', name: 'Acessórios' },
        { id: 'aneis', name: 'Anéis' },
        { id: 'brincos', name: 'Brincos' },
        { id: 'colares', name: 'Colares' },
        { id: 'relogios', name: 'Relógios' }
      ];

  return (
    <header className="w-full bg-white">
      {/* Top Bar - Escondido no mobile para limpar visual */}
      <div className="hidden md:block bg-[#f8f8f8] border-b text-[10px] md:text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-gray-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> Atendimento: (99) 9999-9999</span>
          </div>
          <p>Diamond {currentShop === 'pet' ? 'Pet' : 'Luxury'} Store - Qualidade e Confiança.</p>
          <div className="flex items-center gap-4">
             <Link to="/meus-pedidos" className="flex items-center gap-1 hover:text-[#B89C6A] transition-colors">
               <MapPin size={12} /> Rastreie seu pedido
             </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Logo Centralizada no Mobile */}
            <div className="flex-1 md:hidden" /> 
            
            <Link to={`/${currentShop}`} className="text-2xl md:text-4xl font-serif font-light tracking-[0.2em] text-[#B89C6A] hover:opacity-80 transition-opacity uppercase">
              {currentShop === 'pet' ? 'Diamond Pet' : 'Diamon'}
            </Link>

            {/* Ícones de Ação - Desktop Only (Mobile usa barra inferior) */}
            <div className="flex-1 flex items-center justify-end gap-2 md:gap-6">
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A]">
                  <User size={20} strokeWidth={1.5} />
                </Button>
                <Link to="/carrinho" className="relative">
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A]">
                    <ShoppingBag size={20} strokeWidth={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#B89C6A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Barra de Busca - Sempre visível, abaixo da logo no mobile */}
          <div className="relative w-full max-w-2xl mx-auto px-0 md:px-4">
            <Input 
              placeholder="O que você procura?" 
              className="rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-[#B89C6A] pr-10 text-xs md:text-sm h-10 md:h-11"
            />
            <Search className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Menu Categorias - Desktop Only */}
      <nav className="hidden md:block border-t border-b overflow-x-auto no-scrollbar scroll-smooth">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-12 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-700 whitespace-nowrap">
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#B89C6A]">
              <Menu size={14} /> Todas
            </li>
            {menuItems.map(item => (
              <li key={item.id}>
                <Link to={`/${currentShop}/categoria/${item.id}`} className="hover:text-[#B89C6A]">
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="cursor-pointer text-[#B89C6A]">Ofertas</li>
          </ul>
        </div>
      </nav>
    </header>
  );
};