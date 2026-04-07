"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, ShoppingBag, Loader2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getSafeProductImage } from '@/utils/imageHandler';

export const OrdersSection = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as any[]) || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B89C6A]" size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Nenhum pedido ainda</h3>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Você ainda não realizou compras em nossa loja.</p>
        <Link to="/">
          <Badge variant="outline" className="px-6 py-2 border-[#B89C6A] text-[#B89C6A] cursor-pointer hover:bg-[#B89C6A] hover:text-white transition-colors">
            Começar a Comprar
          </Badge>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const shipping = Number(order.shipping_cost || 0);
        const subtotal = Number(order.total) - shipping;

        return (
          <div key={order.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-10 bg-gray-50/50 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#B89C6A] border border-gray-100">
                    <Package size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identificação do Pedido</p>
                    <p className="text-lg font-serif font-bold text-gray-900">#{order.id.split('-')[0].toUpperCase()}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} /> Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 md:text-right">Status Atual</p>
                   <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-none rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest w-fit">
                    {order.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#B89C6A]" /> Itens do Pedido
                </h3>
                <div className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-5 group">
                      <Link 
                        to={`/${item.categoryMother}/produto/${item.productId || item.id}`}
                        className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 group-hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} 
                          className="w-full h-full object-cover" 
                          alt={item.name} 
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/${item.categoryMother}/produto/${item.productId || item.id}`}
                          className="text-base font-bold text-gray-800 hover:text-[#B89C6A] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-400 font-medium">
                            Unitário: {formatCurrency(item.price)}
                          </span>
                          <span className="text-[10px] text-gray-400">| {item.quantity} un.</span>
                          {item.selectedVariant && (
                            <span className="bg-gray-100 text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                              <Tag size={8} /> {item.selectedVariant.option_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                         <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-[#B89C6A]" /> Endereço de Entrega
                </h3>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-3">
                  <p className="font-bold text-gray-900 text-sm">{order.customer_data.fullName}</p>
                  <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                    <p>{order.customer_data.address}, {order.customer_data.number}</p>
                    <p>{order.customer_data.city} - {order.customer_data.state}</p>
                    <p className="font-mono">CEP: {order.customer_data.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/80 p-6 md:p-10 border-t flex flex-col md:flex-row justify-end">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Subtotal</span>
                  <span className="text-gray-600 font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Frete</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-600 font-bold"}>
                    {shipping === 0 ? "Grátis" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-serif font-bold text-gray-900">Total do Pedido</span>
                  <span className="text-3xl font-bold text-[#B89C6A]">
                    {formatCurrency(Number(order.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};