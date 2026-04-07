"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/store';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 md:p-8 bg-gray-50/50 border-b flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#B89C6A]/10 text-[#B89C6A] flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pedido #{order.id.split('-')[0]}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full px-3">
                    {order.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
              <p className="text-2xl font-bold text-[#B89C6A]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#B89C6A]" /> Itens
              </h3>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} unidade(s) {item.selectedVariant ? ` - ${item.selectedVariant.option_name}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#B89C6A]" /> Entrega
              </h3>
              <div className="text-sm text-gray-600 space-y-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="font-bold text-gray-900">{order.customer_data.fullName}</p>
                <p className="leading-relaxed">
                  {order.customer_data.address}, {order.customer_data.number}<br />
                  {order.customer_data.city} - {order.customer_data.state}<br />
                  CEP: {order.customer_data.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};