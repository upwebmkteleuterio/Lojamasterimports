import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu size={24} />
          </Button>
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-primary">
            DIAMOND<span className="text-gray-400">STORE</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link to="/home" className="hover:text-primary transition-colors">Início</Link>
          <Link to="/categoria/novidades" className="hover:text-primary transition-colors">Novidades</Link>
          <Link to="/categoria/ofertas" className="hover:text-primary transition-colors">Ofertas</Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <User size={20} />
          </Button>
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};