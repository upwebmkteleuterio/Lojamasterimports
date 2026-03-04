"use client";

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Vendas Hoje', value: 'R$ 2.450,00', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pedidos Pendentes', value: '12', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Novos Clientes', value: '5', icon: Users, color: 'text-[#B89C6A]', bg: 'bg-[#B89C6A]/10' },
    { title: 'Taxa de Conversão', value: '3.2%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <Icon className={stat.color} size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg">Desempenho de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-gray-300">
            [Gráfico de Vendas será implementado aqui]
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-[#B89C6A] mt-2 shrink-0" />
                   <div>
                     <p className="text-sm font-medium text-gray-900">Novo pedido #5432{i}</p>
                     <p className="text-xs text-gray-400">Há {i * 10} minutos</p>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;