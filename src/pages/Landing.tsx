"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CategoryMotherData } from '@/types/store';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();
  const [niches, setNiches] = useState<CategoryMotherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNiches();
  }, []);

  const fetchNiches = async () => {
    try {
      const { data, error } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setNiches(data || []);
    } catch (error) {
      console.error('Erro ao buscar nichos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    /* h-[calc(100vh-64px)] desconta os 64px (h-16) da MobileNavbar no celular */
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-screen w-full overflow-hidden bg-white">
      {niches.length > 0 ? (
        niches.map((niche, index) => (
          <div 
            key={niche.id}
            onClick={() => navigate(`/${niche.id}`)}
            className={cn(
              "group relative flex-1 cursor-pointer overflow-hidden transition-all duration-700 ease-in-out hover:flex-[1.5]",
              index > 0 && "border-t-2 md:border-t-0 md:border-l-2 border-white"
            )}
          >
            <img 
              src={niche.landing_banner || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071"} 
              alt={niche.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg uppercase text-center">{niche.name}</h2>
              <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center italic">
                {niche.id === 'pet' ? "Tudo para o seu melhor amigo" : "Beleza e bem-estar para você"}
              </p>
              <div className="mt-8 border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest text-xs">
                ENTRAR NO MUNDO {niche.name.split(' ')[0]}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center w-full bg-white gap-4">
          <p className="text-gray-400 font-serif text-2xl italic">Loja em manutenção...</p>
          <button onClick={() => navigate('/adm/categorias')} className="text-[#B89C6A] font-bold underline">Configurar Categorias</button>
        </div>
      )}
    </div>
  );
};

export default Landing;