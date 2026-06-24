"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vendasHoje: 0,
    pedidosPendentes: 0,
    novosClientes: 0,
    faturamentoHoje: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      // 1. Vendas e Faturamento de Hoje (Status Pago ou processando)
      const { data: salesToday } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .in('status', ['Pago', 'Preparando Pedido', 'Enviado', 'Entregue']);

      const totalValue = salesToday?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

      // 2. Pedidos Pendentes HOJE - Ajuste cirúrgico com filtro de data para coincidir com o selo 'HOJE'
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .in('status', ['Pendente', 'Pagamento Pendente']);

      // 3. Novos Clientes de Hoje
      const { count: newCustomersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', todayStart);

      // 4. Atividades Recentes (Pedidos de Hoje)
      const { data: ordersToday } = await supabase
        .from('orders')
        .select('id, created_at, total, status, customer_data')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        vendasHoje: salesToday?.length || 0,
        pedidosPendentes: pendingCount || 0,
        novosClientes: newCustomersCount || 0,
        faturamentoHoje: totalValue
      });

      setRecentOrders(ordersToday || []);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { 
      title: 'Faturamento Hoje', 
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.faturamentoHoje), 
      icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' 
    },
    { 
      title: 'Vendas Hoje', 
      value: stats.vendasHoje.toString(), 
      icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' 
    },
    { 
      title: 'Pedidos Pendentes', 
      value: stats.pedidosPendentes.toString(), 
      icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' 
    },
    { 
      title: 'Novos Clientes', 
      value: stats.novosClientes.toString(), 
      icon: Users, color: 'text-[#B89C6A]', bg: 'bg-[#B89C6A]/10' 
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardContent className="p-8">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn("p-4 rounded-2xl", stat.bg)}>
                        <Icon className={stat.color} size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoje</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico (Placeholder) */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[40px] bg-white">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-serif">Desempenho Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-96 flex flex-col items-center justify-center p-8">
            {loading ? (
              <Skeleton className="w-full h-full rounded-3xl" />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-100 rounded-[32px] flex items-center justify-center">
                 <p className="text-gray-300 font-serif italic text-lg">Gráfico de evolução será renderizado aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividades Recentes - Pedidos do Dia */}
        <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-serif">Pedidos de Hoje</CardTitle>
            <Link to="/adm/pedidos" className="text-[10px] font-bold uppercase text-[#B89C6A] hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-gray-50">
               {loading ? (
                 [1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="p-6 flex gap-4">
                     <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                     <div className="flex-1 space-y-2">
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-3 w-20" />
                     </div>
                   </div>
                 ))
               ) : recentOrders.length === 0 ? (
                 <div className="p-20 text-center text-gray-400 italic font-serif">
                   Nenhum pedido hoje.
                 </div>
               ) : (
                 recentOrders.map((order) => (
                   <Link 
                    key={order.id} 
                    to="/adm/pedidos" 
                    className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group"
                   >
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#B89C6A] font-bold border border-gray-100 group-hover:bg-white">
                        {order.customer_data.fullName.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-gray-900 truncate">
                         {order.customer_data.fullName}
                       </p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                         {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ptBR })} • #{order.id.split('-')[0].toUpperCase()}
                       </p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-gray-900">
                         {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                       </p>
                       <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block",
                        order.status === 'Pago' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                       )}>
                         {order.status.split(' ')[0]}
                       </span>
                     </div>
                   </Link>
                 ))
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;