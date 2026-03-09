"use client";

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryMother, Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Truck, Gift, ShieldCheck, RotateCcw } from 'lucide-react';
import { getProductsByMother } from '@/services/products';
import { supabase } from '@/integrations/supabase/client';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';

const Index = () => {
  const { shopType } = useParams<{ shopType: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [nicheData, setNicheData] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    if (!shopType) {
      navigate('/');
      return;
    }
    
    const loadPageData = async () => {
      setLoading(true);
      
      const { data: niche, error } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', shopType)
        .maybeSingle();
      
      if (!niche || error) {
        navigate('/');
        return;
      }

      setNicheData(niche);

      const { data: subs } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', shopType);
      
      if (subs) setSubcategories(subs);

      const productsData = await getProductsByMother(shopType as CategoryMother);
      setProducts(productsData);
      
      setLoading(false);
    };

    loadPageData();
  }, [shopType, navigate]);

  if (loading && !nicheData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 md:pb-0">
      <Navbar />
      
      <section className="relative h-[400px] md:h-[650px] w-full overflow-hidden flex items-center">
        <img 
          src={nicheData?.home_hero_banner || "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070"}
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl text-center md:text-right ml-auto">
            <h2 className="text-3xl md:text-7xl font-serif font-light text-[#B89C6A] mb-4 drop-shadow-sm uppercase">
               {nicheData?.name || "BEM-VINDO"}
            </h2>
            <p className="text-sm md:text-2xl text-gray-700 font-light mb-6 md:mb-10 tracking-wide italic">
              {shopType === 'pet' ? "O luxo que seu melhor amigo merece." : "Elegância e sofisticação em cada detalhe."}
            </p>
            <Button variant="outline" className="rounded-none border-[#B89C6A] text-[#B89C6A] px-8 md:px-12 py-4 md:py-7 text-[10px] md:text-sm font-bold tracking-[0.2em] hover:bg-[#B89C6A] hover:text-white transition-all bg-white/50 backdrop-blur-sm">
              CONFIRA A COLEÇÃO
            </Button>
          </div>
        </div>
      </section>

      {/* Carrossel de Categorias Dinâmico */}
      <CategoryCarousel categories={subcategories} shopType={shopType!} />

      {/* Carrossel de Produtos Dinâmico */}
      <section className="py-12 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-4">
               <h2 className="text-xl md:text-2xl font-serif">Sugestões {nicheData?.name?.split(' ')[0]}</h2>
               <Link to={`/${shopType}/categoria/todos`} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Ver todos</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-x-8 gap-y-12">
            {loading ? (
              [1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
              ))
            ) : (
              products.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
            {!loading && products.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 font-serif italic">Nenhum produto cadastrado neste nicho.</div>
            )}
          </div>
        </div>
      </section>

      {/* Selos de Confiança */}
      <section className="border-t border-b py-8 md:py-10 bg-[#fdfdfd]">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <Truck size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Entrega Rápida</p>
              <p className="text-[8px] md:text-[9px] text-gray-400">para todo Brasil</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <Gift size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Embrulho Presente</p>
              <p className="text-[8px] md:text-[9px] text-gray-400">solicite nas observações</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <ShieldCheck size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Garantia Diamond</p>
              <p className="text-[8px] md:text-[9px] text-gray-400">enviado junto ao pacote</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <RotateCcw size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Troca Fácil</p>
              <p className="text-[8px] md:text-[9px] text-gray-400">entre em contato conosco</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white pt-12 md:pt-20 pb-10 border-t">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
          <div className="md:col-span-1">
            <h3 className="text-xl md:text-2xl font-serif text-[#B89C6A] mb-4 md:mb-6">DIAMON</h3>
            <p className="text-[10px] md:text-xs text-gray-400 leading-loose">
               {shopType === 'pet' ? "Tudo para o seu melhor amigo." : "Valorize a joia que você é."}
               <br /> Copyright © 2026 Diamond LTDA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;