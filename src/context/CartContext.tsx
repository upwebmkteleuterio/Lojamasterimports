import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '@/types/store';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: OrderItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. Carregar carrinho inicial
  useEffect(() => {
    if (user) {
      fetchCartFromDb();
    } else {
      const saved = localStorage.getItem('cart_guest');
      if (saved) setCart(JSON.parse(saved));
      setLoading(false);
    }
  }, [user]);

  const fetchCartFromDb = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const items: OrderItem[] = (data || [])
        .map(item => {
          const p = item.products;
          return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image: p.main_image || '', // Mapeamento crucial aqui
            categoryMother: p.category_mother_id,
            subcategory: p.subcategory_id,
            description: p.description,
            stock: p.stock,
            sku: p.sku,
            active: p.is_active,
            quantity: item.quantity
          } as OrderItem;
        })
        .filter(p => p.id !== null);

      setCart(items);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        let next;
        if (existing) {
          next = prev.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          next = [...prev, { ...product, quantity }];
        }
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      toast.success("Adicionado ao carrinho");
      return;
    }

    try {
      const existing = cart.find(item => item.id === product.id);
      
      if (existing) {
        const newQty = existing.quantity + quantity;
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, quantity });
        if (error) throw error;
      }

      await fetchCartFromDb();
      toast.success("Adicionado ao seu carrinho");
    } catch (error: any) {
      toast.error("Erro ao salvar carrinho");
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      setCart(prev => {
        const next = prev.filter(item => item.id !== productId);
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', productId);
      setCart(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      toast.error("Erro ao remover item");
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);

    if (!user) {
      setCart(prev => {
        const next = prev.map(item => item.id === productId ? { ...item, quantity } : item);
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', productId);
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    } catch (error) {
      toast.error("Erro ao atualizar");
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCart([]);
      localStorage.removeItem('cart_guest');
      return;
    }

    try {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setCart([]);
    } catch (error) {
      toast.error("Erro ao limpar carrinho");
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};