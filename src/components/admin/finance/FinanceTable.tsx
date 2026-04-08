import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface FinanceTableProps {
  orders: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowClick: (order: any) => void;
  formatCurrency: (val: number) => string;
}

export const FinanceTable = ({ 
  orders, 
  loading, 
  currentPage, 
  totalPages, 
  totalCount, 
  onPageChange, 
  onRowClick,
  formatCurrency 
}: FinanceTableProps) => {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-gray-50 hover:bg-transparent">
            <TableHead className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Pedido / Data</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right pr-8">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={4} className="h-16 animate-pulse bg-gray-50/20" /></TableRow>
            ))
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhuma venda encontrada.</TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow 
                key={order.id} 
                className="border-gray-50 hover:bg-gray-50/30 transition-colors cursor-pointer" 
                onClick={() => onRowClick(order)}
              >
                <TableCell className="px-8 py-4">
                  <p className="font-bold text-gray-900 text-sm">#{order.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">{format(new Date(order.created_at), 'dd/MM HH:mm')}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-gray-700">{order.customer_data.fullName}</p>
                  <p className="text-[10px] text-gray-400">{order.customer_data.email}</p>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                        <img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                  <p className="text-[9px] font-bold uppercase text-green-600">{order.status}</p>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={currentPage === 1 || loading} 
            onClick={() => onPageChange(currentPage - 1)} 
            className="rounded-xl bg-white"
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="text-[10px] font-black uppercase text-gray-500">Página {currentPage} de {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={currentPage === totalPages || loading} 
            onClick={() => onPageChange(currentPage + 1)} 
            className="rounded-xl bg-white"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};