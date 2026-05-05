import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maskCEP, BRAZILIAN_STATES } from '@/utils/validation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShippingAddressSectionProps {
  data: any;
  updateField: (field: string, value: string) => void;
}

export const ShippingAddressSection = ({ data, updateField }: ShippingAddressSectionProps) => {
  return (
    <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#B89C6A] text-white flex items-center justify-center font-bold text-lg">2</div>
        <h2 className="text-xl font-serif font-bold text-gray-900">Endereço de Entrega</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">CEP</Label>
          <Input 
            value={data.zipCode} 
            onChange={(e) => updateField('zipCode', maskCEP(e.target.value))} 
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>

        <div className="md:col-span-4 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Endereço</Label>
          <Input 
            value={data.address} 
            onChange={(e) => updateField('address', e.target.value)} 
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Número</Label>
          <Input 
            value={data.number} 
            onChange={(e) => updateField('number', e.target.value)} 
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Cidade</Label>
          <Input 
            value={data.city} 
            onChange={(e) => updateField('city', e.target.value)} 
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Estado</Label>
          <Select value={data.state} onValueChange={(val) => updateField('state', val)}>
            <SelectTrigger className="rounded-2xl h-14 bg-gray-50 border-transparent focus:ring-1 focus:ring-[#B89C6A]/30">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {BRAZILIAN_STATES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label} ({s.value})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};