import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';

export const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <header className="w-full bg-white">
      {/* Top Bar */}
      <div className="bg-[#f8f8f8] border-b text-[10px] md:text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-gray-500 font-medium">
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> Atendimento: (99) 9999-9999</span>
          </div>
          <p className="flex-1 text-center md:text-left">Essa é uma loja modelo Diamond. Todos os produtos e preços são ilustrativos.</p>
          <div className="flex items-center gap-4">
             <Link to="/meus-pedidos" className="flex items-center gap-1 hover:text-primary transition-colors">
               <MapPin size={12} /> Rastreie seu pedido
             </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 hidden md:block" />
          
          <Link to="/" className="text-4xl font-serif font-light tracking-[0.2em] text-[#B89C6A] hover:opacity-80 transition-opacity">
            DIAMON
          </Link>

          <div className="flex-1 w-full md:w-auto flex items-center justify-end gap-6">
            <div className="relative w-full max-w-[300px] hidden sm:block">
              <Input 
                placeholder="Buscar produto" 
                className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-[#B89C6A] pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <User size={22} strokeWidth={1.5} />
              </Button>
              <Link to="/carrinho" className="relative">
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <ShoppingBag size={22} strokeWidth={1.5} />
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
      </div>

      {/* Menu Categorias */}
      <nav className="border-t border-b overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-6 md:gap-10 py-4 text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-700 whitespace-nowrap">
            <li className="flex items-center gap-2 cursor-pointer hover:text-[#B89C6A] transition-colors">
              <Menu size={14} /> Categorias
            </li>
            <li className="cursor-pointer hover:text-[#B89C6A] transition-colors">Acessórios</li>
            <li className="cursor-pointer hover:text-[#B89C6A] transition-colors">Anéis</li>
            <li className="cursor-pointer hover:text-[#B89C6A] transition-colors">Brincos</li>
            <li className="cursor-pointer hover:text-[#B89C6A] transition-colors">Colares</li>
            <li className="cursor-pointer hover:text-[#B89C6A] transition-colors">Relógios</li>
            <li className="cursor-pointer text-[#B89C6A]">Ofertas da semana</li>
          </ul>
        </div>
      </nav>
    </header>
  );
};