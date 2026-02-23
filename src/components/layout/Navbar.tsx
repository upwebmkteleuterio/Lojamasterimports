"use client";

import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const { cartCount } = useCart();
  const { shopType } = useParams<{ shopType: string }>();
  const location = useLocation();
  
  const currentShop = shopType || 'feminine';
  const isCheckoutOrCart = location.pathname === '/carrinho' || location.pathname === '/checkout';

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
      {/* Top Bar - Desktop */}
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
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="relative flex items-center justify-between md:grid md:grid-cols-3">
          
          {/* Lado Esquerdo (Desktop Only) */}
          <div className="hidden md:block" />

          {/* Logo - Centralizado em todos os dispositivos */}
          <div className="flex-1 md:flex-none flex justify-center">
            <Link to={`/${currentShop}`} className="text-2xl md:text-4xl font-serif font-light tracking-[0.2em] text-[#B89C6A] hover:opacity-80 transition-opacity uppercase whitespace-nowrap">
              {currentShop === 'pet' ? 'Diamond Pet' : 'Diamon'}
            </Link>
          </div>

          {/* Lado Direito (Desktop Only para Ícones e Busca) */}
          <div className="hidden md:flex items-center justify-end gap-4 flex-1">
            {!isCheckoutOrCart && (
              <div className="relative w-64 items-center">
                <Input 
                  placeholder="Pesquisar..." 
                  className="rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-[#B89C6A] h-9 text-xs pr-8"
                />
                <Search className="absolute right-3 text-gray-400" size={14} />
              </div>
            )}

            <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A] h-9 w-9">
              <User size={20} strokeWidth={1.5} />
            </Button>
            
            <Link to="/carrinho" className="relative">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A] h-9 w-9">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B89C6A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Placeholder para manter logo centralizado no mobile sem ícones à direita */}
          <div className="flex-1 md:hidden" />
        </div>

        {/* Barra de Busca Mobile: Apenas quando não estiver no checkout/carrinho */}
        {!isCheckoutOrCart && (
          <div className="md:hidden mt-4 relative w-full">
            <Input 
              placeholder="O que você procura?" 
              className="rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-[#B89C6A] pr-10 text-xs h-10"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        )}
      </div>

      {/* Menu Categorias - Desktop Only. Aparece em todas as páginas exceto Checkout/Carrinho */}
      {!isCheckoutOrCart && (
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
      )}
    </header>
  );
};