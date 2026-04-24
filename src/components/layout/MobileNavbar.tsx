"use client";

import React from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Home, Dog, Sparkles, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { session } = useAuth();
  const { shopType } = useParams<{ shopType: string }>();
  
  const currentShop = shopType || 'cuidadosfemininos';

  const navItems = [
    { label: 'Home', icon: Home, path: `/${currentShop}` },
    { label: 'Pet', icon: Dog, path: '/petshop' },
    { label: 'Mulher', icon: Sparkles, path: '/cuidadosfemininos' },
    { label: 'Carrinho', icon: ShoppingCart, path: '/carrinho', badge: cartCount },
    { label: 'Você', icon: User, path: '/minha-conta' },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (path === '/minha-conta' && !session) {
      e.preventDefault();
      navigate('/login', { state: { from: location } });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors",
                isActive ? "text-[#B89C6A]" : "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#B89C6A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};