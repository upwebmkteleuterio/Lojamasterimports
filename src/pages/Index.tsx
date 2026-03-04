"use client";

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryMother, Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Truck, Gift, ShieldCheck, RotateCcw } from 'lucide-react';
import { getProductsByMother } from '@/services/products';

const Index = () => {
  const { shopType } = useParams<{ shopType: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopType !== 'pet' && shopType !== 'feminine') {
      navigate('/');
      return;
    }
    
    const loadProducts = async () => {
      setLoading(true);
      const data = await getProductsByMother(shopType as CategoryMother);
      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, [shopType, navigate]);

  const isPet = shopType === 'pet';

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 md:pb-0">
      <Navbar />
      
      <section className="relative h-[400px] md:h-[650px] w-full overflow-hidden flex items-center">
        <img 
          src={isPet 
            ? "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" 
            : "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop"
          }
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl text-center md:text-right ml-auto">
            <h2 className="text-3xl md:text-7xl font-serif font-light text-[#B89C6A] mb-4 drop-shadow-sm">
              {isPet ? "Cuidado &" : "Beleza &"} <br /> Sofisticação
            </h2>
            <p className="text-sm md:text-2xl text-gray-700 font-light mb-6 md:mb-10 tracking-wide italic">
              {isPet ? "O luxo que seu melhor amigo merece." : "O cuidado que sua pele necessita."}
            </p>
            <Button variant="outline" className="rounded-none border-[#B89C6A] text-[#B89C6A] px-8 md:px-12 py-4 md:py-7 text-[10px] md:text-sm font-bold tracking-[0.2em] hover:bg-[#B89C6A] hover:text-white transition-all bg-white/50 backdrop-blur-sm">
              CONFIRA A COLEÇÃO
            </Button>
          </div>
        </div>
      </section>

      {/* Categorias Grid */}
      <section className="py-12 md:py-20 container mx-auto px-4">
        <h2 className="text-xl md:text-3xl font-serif text-center mb-8 md:mb-12 text-gray-800">Escolha por categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
          {(isPet 
            ? [
                { id: 'conforto', name: 'Conforto', img: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dfa?q=80&w=1000' },
                { id: 'higiene', name: 'Higiene', img: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=1000' },
                { id: 'brinquedos', name: 'Brinquedos', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000' },
                { id: 'acessorios', name: 'Acessórios', img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop' },
                { id: 'saude', name: 'Saúde', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1000' }
              ]
            : [
                { id: 'aneis', name: 'Anéis', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000' },
                { id: 'brincos', name: 'Brincos', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000' },
                { id: 'pulseiras', name: 'Pulseiras', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000' },
                { id: 'colares', name: 'Colares', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000' },
                { id: 'relogios', name: 'Relógios', img: 'https://images.unsplash.com/photo-1524333865983-81f249936e60?q=80&w=1000' }
              ]
          ).map((cat, i) => (
            <Link key={i} to={`/${shopType}/categoria/${cat.id}`} className="group cursor-pointer text-center">
              <div className="aspect-square overflow-hidden mb-3 md:mb-4 bg-gray-50 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 group-hover:text-[#B89C6A]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Carrossel de Produtos */}
      <section className="py-12 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-4">
               <h2 className="text-xl md:text-2xl font-serif">Sugestões Diamond</h2>
               <Link to={`/${shopType}/categoria/todos`} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary">Ver todos</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />)
            ) : (
              products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
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
               {isPet ? "Tudo para o seu melhor amigo." : "Valorize a joia que você é."}
               <br /> Copyright © 2026 Diamond LTDA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;