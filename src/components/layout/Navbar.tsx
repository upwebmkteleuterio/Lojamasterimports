"use client";

import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { cartCount } = useCart();
  const { shopType } = useParams<{ shopType: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [menuItems, setMenuItems] = useState<{ id: string, name: string }[]>([]);
  const [niches, setNiches] = useState<{ id: string, name: string }[]>([]);
  
  const currentShop = shopType || 'feminine';
  
  useEffect(() => {
    fetchSubcategories();
    fetchNiches();
  }, [currentShop]);

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('mother_id', currentShop);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
    }
  };

  const fetchNiches = async () => {
    try {
      const { data, error } = await supabase
        .from('category_mothers')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;
      setNiches(data || []);
    } catch (error) {
      console.error('Erro ao buscar nichos:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/${currentShop}/busca?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Lógica específica: Ocultar Navbar completa no Mobile para a página de Produto
  const isProductPage = location.pathname.includes('/produto/');
  if (isMobile && isProductPage) {
    return null;
  }

  // Páginas onde a busca e o menu de categorias devem ser ocultados (apenas fluxo de finalização)
  const pagesWithoutSearch = ['/carrinho', '/checkout'];
  const shouldHideElements = pagesWithoutSearch.includes(location.pathname);

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm border-b border-gray-50">
      {/* Top Bar - Desktop */}
      <div className="hidden md:block bg-[#f8f8f8] border-b text-[10px] md:text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-gray-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone size={12} /> Atendimento: (99) 9999-9999</span>
          </div>
          <p>Diamond Store - Qualidade e Confiança.</p>
          <div className="flex items-center gap-4">
             <Link to="/minha-conta" className="flex items-center gap-1 hover:text-[#B89C6A] transition-colors">
               <MapPin size={12} /> Rastreie seu pedido
             </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="relative flex items-center justify-between md:grid md:grid-cols-3 items-center">
          
          {/* Navegação de Nichos - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {niches.map((niche) => (
              <Link 
                key={niche.id} 
                to={`/${niche.id}`}
                className={cn(
                  "flex items-center justify-center px-5 h-9 rounded-full border text-[9px] font-bold uppercase tracking-[0.15em] transition-all",
                  currentShop === niche.id 
                    ? "bg-white border-[#B89C6A] text-[#B89C6A] shadow-sm" 
                    : "bg-gray-50/50 border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-white hover:border-gray-200"
                )}
              >
                {niche.name}
              </Link>
            ))}
          </div>

          <div className="flex justify-center flex-shrink-0">
            <Link to={`/${currentShop}`} className="text-2xl md:text-3xl font-serif font-light tracking-[0.2em] text-[#B89C6A] hover:opacity-80 transition-opacity uppercase whitespace-nowrap">
              {currentShop === 'pet' ? 'Diamond Pet' : 'Diamon'}
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-4">
              {!shouldHideElements && (
                <form onSubmit={handleSearch} className="relative w-64 flex items-center mr-2">
                  <Input
                    placeholder="Pesquisar..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-[#B89C6A] h-9 text-xs pr-10"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={14} />
                  </button>
                </form>
              )}

              <Link to="/minha-conta">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A] h-9 w-9">
                  <User size={20} strokeWidth={1.5} />
                </Button>
              </Link>
              
              <Link to="/carrinho" className="relative">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A] h-9 w-9">
                  <ShoppingCart size={20} strokeWidth={1.5} />
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

        {!shouldHideElements && (
          <form onSubmit={handleSearch} className="md:hidden mt-4 relative w-full">
            <Input 
              placeholder="O que você procura?" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-[#B89C6A] pr-10 text-xs h-10"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </button>
          </form>
        )}
      </div>

      {!shouldHideElements && menuItems.length > 0 && (
        <nav className="hidden md:block border-t">
          <div className="container mx-auto px-4">
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-700">
              {menuItems.map(item => (
                <li key={item.id} className="shrink-0">
                  <Link to={`/${currentShop}/categoria/${item.id}`} className="hover:text-[#B89C6A] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="cursor-pointer text-[#B89C6A] hover:opacity-80 shrink-0">Ofertas</li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
};