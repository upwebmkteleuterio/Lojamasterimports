"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { getStorageItem } from '@/services/persistence';
import { CategoryMother, Product } from '@/types/store';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Truck, Gift, ShieldCheck, RotateCcw } from 'lucide-react';
import { getProductsByMother } from '@/services/products';

const Index = () => {
  const [motherCategory, setMotherCategory] = useState<CategoryMother | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = getStorageItem<CategoryMother>('mother_category');
    setMotherCategory(saved || 'feminine');
    setProducts(getProductsByMother(saved || 'feminine'));
  }, []);

  const isPet = motherCategory === 'pet';

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      
      {/* 1. Hero Section */}
      <section className="relative h-[500px] md:h-[650px] w-full overflow-hidden flex items-center">
        <img 
          src={isPet 
            ? "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" 
            : "https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?q=80&w=2070&auto=format&fit=crop"
          }
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl text-center md:text-right ml-auto">
            <h2 className="text-4xl md:text-7xl font-serif font-light text-[#B89C6A] mb-4 drop-shadow-sm">
              Sofisticação <br /> & Requinte
            </h2>
            <p className="text-lg md:text-2xl text-gray-700 font-light mb-10 tracking-wide italic">
              {isPet ? "O luxo que seu melhor amigo merece." : "Valorize a joia que você é."}
            </p>
            <Button variant="outline" className="rounded-none border-[#B89C6A] text-[#B89C6A] px-12 py-7 text-sm font-bold tracking-[0.2em] hover:bg-[#B89C6A] hover:text-white transition-all">
              CONFIRA A COLEÇÃO
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Categorias Grid */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 text-gray-800">Escolha por categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
          {[
            { name: 'Anéis', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop' },
            { name: 'Brincos', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop' },
            { name: 'Pulseiras', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop' },
            { name: 'Colares', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1887&auto=format&fit=crop' },
            { name: 'Relógios', img: 'https://images.unsplash.com/photo-1524333865983-81f249936e60?q=80&w=1887&auto=format&fit=crop' }
          ].map((cat, i) => (
            <div key={i} className="group cursor-pointer text-center">
              <div className="aspect-square overflow-hidden mb-4 bg-gray-50 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 group-hover:text-[#B89C6A]">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Lançamento Promo */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left md:pr-12">
            <h3 className="text-3xl md:text-4xl font-serif text-gray-800">Conheça nosso divino lançamento: <br /> Coleção Grécia</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              A inspiração para essa temporada foi dar força e delicadeza para as deusas do mundo real, com peças que traduzem o feminino em peças únicas de ouro trabalhado.
            </p>
            <Button variant="outline" className="rounded-none border-black text-[10px] font-bold tracking-widest px-10 py-6 hover:bg-black hover:text-white">
              CONHEÇA AGORA
            </Button>
          </div>
          <div className="flex-1 flex gap-4 h-[400px] w-full">
            <div className="flex-1 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1887&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Carrossel de Produtos */}
      <section className="py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-serif">Para todos os momentos</h2>
               <Link to="/categoria/todos" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary">Ver todos</Link>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="icon" className="rounded-none border-gray-200"><ChevronLeft size={16} /></Button>
               <Button variant="outline" size="icon" className="rounded-none border-gray-200"><ChevronRight size={16} /></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Ofertas da Semana */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-serif mb-2">Ofertas da semana</h2>
            <p className="text-xs text-gray-400 mb-10">Elegância com um preço que cabe no orçamento de quem ama requinte.</p>
            
            <div className="space-y-6">
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex gap-6 items-center group">
                  <div className="w-40 h-40 bg-gray-50 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <span className="bg-black text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter">Promoção</span>
                    <h4 className="text-sm font-medium mt-2 mb-1">{p.name}</h4>
                    <p className="text-xs text-gray-400 line-through">R$ {p.price * 1.25}</p>
                    <p className="font-bold text-lg">R$ {p.price}</p>
                    <Button variant="link" className="p-0 text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">Comprar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 h-[600px] overflow-hidden">
             <img 
               src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1887&auto=format&fit=crop" 
               className="w-full h-full object-cover"
               alt="Destaque"
             />
          </div>
        </div>
      </section>

      {/* 6. Selos de Confiança */}
      <section className="border-t border-b py-10 bg-[#fdfdfd]">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <Truck size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Entrega Rápida</p>
              <p className="text-[9px] text-gray-400">para todo Brasil</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <Gift size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Embrulho Presente</p>
              <p className="text-[9px] text-gray-400">solicite nas observações</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <ShieldCheck size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Garantia Diamond</p>
              <p className="text-[9px] text-gray-400">enviado junto ao pacote</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <RotateCcw size={24} strokeWidth={1} className="text-[#B89C6A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Troca Fácil</p>
              <p className="text-[9px] text-gray-400">entre em contato conosco</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-serif text-[#B89C6A] mb-6">DIAMON</h3>
            <p className="text-xs text-gray-400 leading-loose">
               Essa é uma loja modelo Diamond. Todos os produtos e preços são ilustrativos. 
               Copyright © 2026 Diamond LTDA.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6">Informações</h4>
            <ul className="text-[11px] text-gray-500 space-y-3">
              <li>CONTATO</li>
              <li>PERGUNTAS FREQUENTES</li>
              <li>POLÍTICAS DE PRIVACIDADE</li>
              <li>SOBRE NÓS</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6">Redes Sociais</h4>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black cursor-pointer">f</div>
               <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black cursor-pointer">i</div>
               <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black cursor-pointer">y</div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-widest">
           <span>Rua Analia Maria de Lima Ramos 70 - Parque Industrial</span>
           <span>Usamos Yampi</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;