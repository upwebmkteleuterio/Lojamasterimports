import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, BadgePercent } from 'lucide-react';

interface FinanceKPIsProps {
  stats: {
    totalRevenue: number;
    totalProfit: number;
    orderCount: number;
  };
  formatCurrency: (val: number) => string;
}

export const FinanceKPIs = ({ stats, formatCurrency }: FinanceKPIsProps) => {
  const profitMargin = stats.totalRevenue > 0 
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-green-50 text-green-600">
              <DollarSign size={24} />
            </div>
            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
              {stats.orderCount} vendas
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total em Vendas</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-[#B89C6A]/10 text-[#B89C6A]">
              <TrendingUp size={24} />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Real</div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lucro Líquido</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalProfit)}</p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[32px] bg-gray-900">
        <CardContent className="p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-white/10 text-white">
              <BadgePercent size={24} />
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eficiência</div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Margem de Lucro</p>
          <p className="text-3xl font-bold mt-2">{profitMargin}%</p>
        </CardContent>
      </Card>
    </div>
  );
};