import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const handleAuthChange = async () => {
      // Se o usuário acabou de logar (passou de nulo para um ID)
      if (user && user.id !== lastUserId.current) {
        setLoading(true);
        await migrateGuestCart(user.id);
        await fetchCartFromDb();
        lastUserId.current = user.id;
      } 
      // Se deslogou
      else if (!user) {
        const saved = localStorage.getItem('cart_guest');
        if (saved) setCart(JSON.parse(saved));
        else setCart([]);
        setLoading(false);
        lastUserId.current = null;
      }
    };

    handleAuthChange();
  }, [user]);

  const migrateGuestCart = async (userId: string) => {
    const guestData = localStorage.getItem('cart_guest');
    if (!guestData) return;

    try {
      const guestItems: any[] = JSON.parse(guestData);
      if (guestItems.length === 0) return;

      diamondDebug('info', `Migrando ${guestItems.length} itens do carrinho de convidado para o usuário ${userId}`);

      for (const item of guestItems) {
        // Tenta adicionar ao banco usando a lógica de duplicidade já existente no Supabase
        await addToCartDb(userId, item.productId, item.selectedVariant?.id || null, item.quantity);
      }

      localStorage.removeItem('cart_guest');
      diamondDebug('success', 'Migração de carrinho concluída.');
    } catch (error) {
      diamondDebug('error', 'Falha na migração do carrinho', error);
    }
  };

  const getJoinedObject = (obj: any) => {
    if (!obj) return null;
    return Array.isArray(obj) ? obj[0] : obj;
  };

  const fetchCartFromDb = async () => {
    if (!user) return;
    
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
        .eq('user_id', user.id);

      if (error) throw error;

      const items: OrderItem[] = (data || [])
        .map(item => {
          const p = getJoinedObject(item.products);
          const v = getJoinedObject(item.product_variants);
          if (!p) return null;

          return {
            id: item.id,
            productId: p.id,
            name: p.name,
            price: Number(v && v.price ? v.price : p.price),
            image: (v && v.main_image && v.main_image !== '') ? v.main_image : (p.main_image || ''),
            categoryMother: p.category_mother_id,
            subcategory: p.subcategory_id,
            description: p.description || '',
            stock: v ? v.stock : p.stock,
            sku: v ? v.sku : p.sku,
            active: p.is_active,
            quantity: item.quantity,
            selectedVariant: v || undefined
          };
        })
        .filter(item => item !== null) as OrderItem[];

      setCart(items);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCartDb = async (userId: string, productId: string, variantId: string | null, quantity: number) => {
    let checkQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (variantId) checkQuery = checkQuery.eq('variant_id', variantId);
    else checkQuery = checkQuery.is('variant_id', null);

    const { data: existing } = await checkQuery.maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ 
          user_id: userId, 
          product_id: productId, 
          variant_id: variantId,
          quantity 
        });
    }
  };

  const addToCart = async (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    if (!user) {
      setCart(prev => {
        const itemKey = variant ? `${product.id}-${variant.id}` : product.id;
        const existing = prev.find(item => item.id === itemKey);
        let next;
        if (existing) {
          next = prev.map(item => item.id === itemKey ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
          next = [...prev, { 
            id: itemKey, productId: product.id, name: product.name, quantity, 
            selectedVariant: variant, price: variant ? variant.price : product.price,
            image: (variant && variant.main_image) ? variant.main_image : product.image,
            categoryMother: product.categoryMother, active: product.active
          } as any];
        }
        localStorage.setItem('cart_guest', JSON.stringify(next));
        return next;
      });
      toast.success("Adicionado ao carrinho");
      return;
    }

    try {
      await addToCartDb(user.id, product.id, variant ? variant.id : null, quantity);
      await fetchCartFromDb();
      toast.success("Adicionado ao seu carrinho");
    } catch (error: any) {
      console.error(error);
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
      const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
      if (error) throw error;
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
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
      if (error) throw error;
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