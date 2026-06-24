"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  vendas: number;
  valor: number;
}

interface DashboardChartProps {
  data: ChartData[];
}

export const DashboardChart = ({ data }: DashboardChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <defs>
            {/* Gradiente luxuoso para a área do gráfico, combinando com o tom dourado da loja */}
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B89C6A" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#B89C6A" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#F3F4F6" 
          />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} 
            dy={15}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
            tickFormatter={(value) => `R$ ${value}`}
            dx={-10}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111827', 
              border: 'none', 
              borderRadius: '16px', 
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => [formatCurrency(value), 'Faturamento']}
            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke="#B89C6A" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;