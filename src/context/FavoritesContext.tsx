import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/store';
import { getFavorites, saveFavorites } from '@/services/persistence';
import { toast } from '@/utils/toast';

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Carregar favoritos iniciais
  useEffect(() => {
    const saved = getFavorites();
    if (saved) {
      setFavorites(saved);
    }
  }, []);

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const isAlreadyFavorite = prev.some((p) => p.id === product.id);
      let newFavorites;
      
      if (isAlreadyFavorite) {
        newFavorites = prev.filter((p) => p.id !== product.id);
        toast.info("Removido dos favoritos");
      } else {
        newFavorites = [...prev, product];
        toast.success("Adicionado aos favoritos");
      }
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some((p) => p.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
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
