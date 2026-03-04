import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      // Se deslogado, tenta carregar do localStorage como fallback (modo convidado)
      const saved = localStorage.getItem('favorites_guest');
      if (saved) setFavorites(JSON.parse(saved));
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const products = (data || [])
        .map(item => item.products)
        .filter(p => p !== null);
      
      setFavorites(products);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (product: Product) => {
    if (!user) {
      // Lógica de convidado (localStorage)
      setFavorites(prev => {
        const isFav = prev.some(p => p.id === product.id);
        const newFavs = isFav ? prev.filter(p => p.id !== product.id) : [...prev, product];
        localStorage.setItem('favorites_guest', JSON.stringify(newFavs));
        toast.info(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos (entre para salvar na nuvem)");
        return newFavs;
      });
      return;
    }

    const isAlreadyFavorite = favorites.some(p => p.id === product.id);

    try {
      if (isAlreadyFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        if (error) throw error;
        setFavorites(prev => prev.filter(p => p.id !== product.id));
        toast.info("Removido dos favoritos");
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setFavorites(prev => [...prev, product]);
        toast.success("Salvo nos seus favoritos");
      }
    } catch (error: any) {
      toast.error("Erro ao atualizar favoritos");
      console.error(error);
    }
  };

  const isFavorite = (id: string) => favorites.some(p => p.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
