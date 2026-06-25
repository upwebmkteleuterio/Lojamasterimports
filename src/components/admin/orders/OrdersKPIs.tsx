import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface OrdersKPIsProps {
  totalCount: number;
  kpis: { totalValue: number; totalProducts: number };
}

export const OrdersKPIs = ({ totalCount, kpis }: OrdersKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total em Pedidos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalProducts}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total em Reais</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis.totalValue)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};