"use client";

import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Phone, MapPin, ChevronRight, LayoutGrid, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpg';
import { getSafeProductImage } from '@/utils/imageHandler';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  const { cart, cartCount, cartTotal } = useCart();
  const { session } = useAuth();
  const { shopType } = useParams<{ shopType: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState("");
  const [menuItems, setMenuItems] = useState<{ id: string, name: string }[]>([]);
  const [niches, setNiches] = useState<{ id: string, name: string }[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
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

  const handleCheckout = () => {
    setIsSheetOpen(false);
    navigate('/checkout');
  };

  const handleAccountClick = () => {
    if (!session) {
      navigate('/login', { state: { from: location } });
    } else {
      navigate('/minha-conta');
    }
  };

  // Ocultar Navbar completa no Mobile para a página de Produto
  const isProductPage = location.pathname.includes('/produto/');
  if (isMobile && isProductPage) {
    return null;
  }

  const pagesWithoutSearch = ['/carrinho', '/checkout'];
  const shouldHideElements = pagesWithoutSearch.includes(location.pathname);

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm border-b border-gray-50">
      {/* Top Bar - Desktop */}
      <div className="hidden md:block bg-[#f8f8f8] border-b text-[10px] md:text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-gray-500 font-medium">
          <div className="flex-1"></div>
          <p className="flex-1 text-center">Master Imports - Qualidade e Confiança.</p>
          <div className="flex-1 flex justify-end items-center gap-4">
             <a
               href="https://rastreamento.correios.com.br/app/index.php"
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-1 hover:text-[#B89C6A] transition-colors"
             >
               <MapPin size={12} /> Rastreie seu pedido
             </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          
          {/* Lado Esquerdo - Desktop (Nichos) / Mobile (Espaçador) */}
          <div className="flex-1 hidden md:flex items-center gap-3">
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

          <div className="md:hidden flex-1" />

          {/* Centro - Logo */}
          <div className="flex justify-center flex-shrink-0">
            <Link to={`/${currentShop}`} className="block hover:opacity-80 transition-opacity">
              <img src={logo} alt="Master Imports Logo" className="h-12 md:h-16 w-auto object-contain" />
            </Link>
          </div>

          {/* Lado Direito - Ações */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            {!shouldHideElements && (
              <form onSubmit={handleSearch} className="hidden md:relative md:flex items-center w-64 mr-2">
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

            {!shouldHideElements && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-gray-700 h-9 w-9">
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0 flex flex-col rounded-l-[32px] border-none">
                  <SheetHeader className="p-6 border-b border-gray-50 text-left">
                    <SheetTitle className="text-xs font-bold uppercase tracking-[0.2em] text-[#B89C6A] flex items-center gap-2">
                      <LayoutGrid size={16} /> Menu Principal
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {/* Alterar Loja */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Alterar Loja</p>
                      <div className="flex flex-col gap-2">
                        {niches.map(niche => (
                          <Link 
                            key={niche.id} 
                            to={`/${niche.id}`}
                            onClick={() => setIsSheetOpen(false)}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all",
                              currentShop === niche.id 
                                ? "bg-[#B89C6A] border-[#B89C6A] text-white" 
                                : "bg-gray-50 border-gray-100 text-gray-500"
                            )}
                          >
                            {niche.name}
                            {currentShop === niche.id && <ChevronRight size={14} />}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Meu Carrinho */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                        Meu Carrinho
                        {cartCount > 0 && <span className="bg-[#B89C6A]/10 text-[#B89C6A] px-2 py-0.5 rounded-lg text-[9px]">{cartCount} itens</span>}
                      </p>
                      
                      {cart.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <ShoppingBag size={24} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Seu carrinho está vazio</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {cart.map((item) => (
                              <div key={item.id} className="min-w-[120px] w-[120px] space-y-2 group">
                                <div className="aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                                   <img 
                                    src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                   />
                                   <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                     {item.quantity}x
                                   </div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-700 truncate px-1">{item.name}</p>
                                <p className="text-[9px] font-black text-[#B89C6A] px-1">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-4 px-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                              <span className="text-sm font-black text-gray-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                              </span>
                            </div>
                            <Button 
                              onClick={handleCheckout}
                              className="w-full h-14 rounded-full bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-black/10"
                            >
                              Finalizar Compra
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-50 space-y-4">
                    <button 
                      onClick={() => { setIsSheetOpen(false); handleAccountClick(); }}
                      className="flex items-center gap-3 text-sm font-bold text-gray-700 w-full text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      {session ? 'Minha Conta' : 'Fazer Login'}
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-[#B89C6A] h-9 w-9" onClick={handleAccountClick}>
                <User size={20} strokeWidth={1.5} />
              </Button>
              
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