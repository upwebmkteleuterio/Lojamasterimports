import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, ProductVariant } from '@/types/store';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { diamondDebug } from '@/utils/debug';

interface CartContextType {
  cart: OrderItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
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
          id,
          quantity,
          variant_id,
          products (*),
          product_variants:variant_id (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const items: OrderItem[] = (data || [])
        .map(item => {
          const p = item.products;
          const v = item.product_variants;
          
          return {
            id: item.id,
            productId: p.id,
            name: p.name,
            price: Number(v ? v.price : p.price),
            image: (v && v.main_image) ? v.main_image : (p.main_image || ''),
            categoryMother: p.category_mother_id,
            subcategory: p.subcategory_id,
            description: p.description,
            stock: v ? v.stock : p.stock,
            sku: v ? v.sku : p.sku,
            active: p.is_active,
            quantity: item.quantity,
            selectedVariant: v || undefined
          } as any;
        });

      setCart(items);
      diamondDebug('success', `Carrinho sincronizado com o banco. ${items.length} itens.`);
    } catch (error) {
      diamondDebug('error', 'Falha ao buscar carrinho no Supabase', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    diamondDebug('info', `Iniciando adição: ${product.name}`, { variant_id: variant?.id });

    if (!user) {
      setCart(prev => {
        // Para convidados, usamos um ID composto para evitar colisão de variações
        const itemKey = variant ? `${product.id}-${variant.id}` : product.id;
        
        const existing = prev.find(item => item.id === itemKey);
        
        let next;
        if (existing) {
          next = prev.map(item => 
            item.id === itemKey ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          const newItem: any = { 
            id: itemKey,
            productId: product.id,
            name: product.name,
            quantity, 
            selectedVariant: variant,
            price: variant ? variant.price : product.price,
            image: (variant && variant.main_image) ? variant.main_image : product.image,
            categoryMother: product.categoryMother,
            active: product.active
          };
          next = [...prev, newItem];
        }
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      toast.success("Adicionado ao carrinho");
      return;
    }

    try {
      // Verifica duplicata no banco considerando a variante
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .filter('variant_id', variant ? 'eq' : 'is', variant ? variant.id : null)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        diamondDebug('info', 'Item já existe no carrinho. Incrementando quantidade.', { id: existing.id });
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        diamondDebug('info', 'Inserindo novo item no carrinho do banco.');
        await supabase
          .from('cart_items')
          .insert({ 
            user_id: user.id, 
            product_id: product.id, 
            variant_id: variant ? variant.id : null,
            quantity 
          });
      }

      await fetchCartFromDb();
      toast.success("Adicionado ao seu carrinho");
    } catch (error: any) {
      diamondDebug('error', 'Erro ao processar adição ao carrinho no banco', error);
      toast.error("Erro ao salvar carrinho");
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) {
      setCart(prev => {
        const next = prev.filter(item => item.id !== cartItemId);
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await supabase.from('cart_items').delete().eq('id', cartItemId);
      setCart(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      toast.error("Erro ao remover item");
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(cartItemId);

    if (!user) {
      setCart(prev => {
        const next = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
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