import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  onCustomDateSelect: () => void;
  setCurrentPage: (page: number) => void;
}

export const OrdersFilters = ({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  dateFilter, setDateFilter,
  onCustomDateSelect,
  setCurrentPage
}: OrdersFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Buscar por ID, nome ou e-mail..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="pl-12 rounded-2xl border-gray-100 bg-gray-50/50 h-12"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={dateFilter} onValueChange={(val) => { 
          if (val === 'custom') onCustomDateSelect();
          else { setDateFilter(val); setCurrentPage(1); }
        }}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-gray-100 bg-gray-50/50 h-12">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <SelectValue placeholder="Período" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="yesterday">Ontem</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="15d">Últimos 15 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-gray-100 bg-gray-50/50 h-12">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Pagamento Pendente">Pagamento Pendente</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Em Processamento">Em Processamento</SelectItem>
            <SelectItem value="Preparando Pedido">Preparando</SelectItem>
            <SelectItem value="Enviado">Enviado</SelectItem>
            <SelectItem value="Entregue">Entregue</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};