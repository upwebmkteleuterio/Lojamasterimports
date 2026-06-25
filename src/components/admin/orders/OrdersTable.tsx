import React from 'react';
import { Order } from '@/types/store';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { statusColors, statusIcons } from '@/utils/orderConstants';
import { ITEMS_PER_PAGE } from '@/hooks/useOrdersAdmin';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  openDetails: (order: Order) => void;
}

export const OrdersTable = ({
  orders, loading, currentPage, totalCount, setCurrentPage, openDetails
}: OrdersTableProps) => {
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-gray-50 hover:bg-transparent">
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 px-6 py-5">ID / Data</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Cliente</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Total</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Status</TableHead>
            <TableHead className="text-right px-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-gray-50">
                <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/20" />
              </TableRow>
            ))
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-gray-400">Nenhum pedido encontrado no período.</TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const Icon = statusIcons[order.status] || Clock;
              return (
                <TableRow 
                  key={order.id} 
                  className="border-gray-50 group hover:bg-gray-50/30 transition-colors cursor-pointer"
                  onClick={() => openDetails(order)}
                >
                  <TableCell className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-sm">#{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900 text-sm">{order.customer_data.fullName}</p>
                    <p className="text-xs text-gray-400">{order.customer_data.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">{order.items.length} ITENS</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full px-3 py-1 border-none flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase tracking-wider", statusColors[order.status])}>
                      <Icon size={12} /> {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white"><MoreHorizontal size={16} /></Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(prev => prev - 1)} className="rounded-xl bg-white"><ChevronLeft size={18} /></Button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Página {currentPage} de {totalPages}</span>
          <Button variant="outline" size="icon" disabled={currentPage === totalPages || loading} onClick={() => setCurrentPage(prev => prev + 1)} className="rounded-xl bg-white"><ChevronRight size={18} /></Button>
        </div>
      )}
    </div>
  );
};