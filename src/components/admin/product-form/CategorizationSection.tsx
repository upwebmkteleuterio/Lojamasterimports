import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CategorizationSectionProps {
  nicheId: string;
  subcategoryId: string;
  stock: number;
  categories: any[];
  onFieldChange: (field: string, value: any) => void;
}

export const CategorizationSection = ({ nicheId, subcategoryId, stock, categories, onFieldChange }: CategorizationSectionProps) => {
  const selectedNiche = categories.find(c => c.id === nicheId);

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50">
        <CardTitle className="text-sm font-bold text-gray-700">Categorização</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
            Nicho / Categoria Mãe <span className="text-red-500 font-bold">*</span>
          </Label>
          <select 
            value={nicheId} 
            onChange={e => onFieldChange('category_mother_id', e.target.value)}
            className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 px-4 text-sm outline-none focus:ring-1 focus:ring-[#B89C6A]"
          >
            <option value="">Selecione o Nicho</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">Subcategoria</Label>
          <select 
            value={subcategoryId} 
            onChange={e => onFieldChange('subcategory_id', e.target.value)} 
            disabled={!nicheId} 
            className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 px-4 text-sm outline-none focus:ring-1 focus:ring-[#B89C6A] disabled:opacity-50"
          >
            <option value="">Selecione a Subcategoria</option>
            {selectedNiche?.subcategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">Estoque Geral</Label>
          <Input type="number" value={stock} onChange={e => onFieldChange('stock', Number(e.target.value))} className="rounded-xl h-12 bg-gray-50 border-gray-100" />
        </div>
      </CardContent>
    </Card>
  );
};