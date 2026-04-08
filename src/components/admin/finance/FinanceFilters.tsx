import React from 'react';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinanceFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  monthOptions: { value: string; label: string }[];
}

export const FinanceFilters = ({ 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateFilterChange, 
  monthOptions 
}: FinanceFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Buscar entrada..." 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="pl-12 rounded-2xl border-gray-100 bg-gray-50/50 h-12" 
        />
      </div>
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-full lg:w-[240px] rounded-2xl border-gray-100 h-12">
          <CalendarIcon size={16} className="mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          <SelectItem value="custom" className="font-bold text-[#B89C6A]">Personalizado</SelectItem>
          {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};