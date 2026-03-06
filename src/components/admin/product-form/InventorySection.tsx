import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface InventorySectionProps {
  sku: string;
  barcode: string;
  onChange: (field: string, value: string) => void;
  onGenerateSku: () => void;
}

export const InventorySection = ({ sku, barcode, onChange, onGenerateSku }: InventorySectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">Código SKU <HelpCircle size={14} className="inline ml-1 text-gray-300" /></Label>
        <div className="flex gap-2">
          <Input value={sku} onChange={e => onChange('sku', e.target.value)} className="rounded-xl h-12 bg-gray-50/50 border-gray-100" />
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onGenerateSku();
            }}
            variant="secondary" 
            className="rounded-xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest"
          >
            GERAR
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">Código de Barras (EAN-13)</Label>
        <Input value={barcode} onChange={e => onChange('barcode', e.target.value)} className="rounded-xl h-12 bg-gray-50/50 border-gray-100" />
      </div>
    </div>
  );
};