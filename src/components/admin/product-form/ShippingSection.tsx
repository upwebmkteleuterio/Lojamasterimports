import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Truck } from 'lucide-react';

interface ShippingSectionProps {
  weight: number;
  width: number;
  height: number;
  length: number;
  onChange: (field: string, value: number) => void;
}

export const ShippingSection = ({ weight, width, height, length, onChange }: ShippingSectionProps) => {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-700">Peso e Dimensões</CardTitle>
        <button className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-2">
          <Truck size={14} /> Dúvidas gerais sobre frete
        </button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 grid grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Peso</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="any"
                  value={weight}
                  onChange={e => onChange('weight', Number(e.target.value))}
                  className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100"
                />
                <div className="absolute right-4 font-bold text-gray-900 text-sm">Kg</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Largura</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="any"
                  value={width}
                  onChange={e => onChange('width', Number(e.target.value))}
                  className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100"
                />
                <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Altura</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="any"
                  value={height}
                  onChange={e => onChange('height', Number(e.target.value))}
                  className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100"
                />
                <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Comprimento</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="any"
                  value={length}
                  onChange={e => onChange('length', Number(e.target.value))}
                  className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100"
                />
                <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex w-48 h-48 items-center justify-center border border-gray-50 rounded-3xl p-4 opacity-20">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-900 stroke-[1]">
                <path d="M10,40 L50,20 L90,40 L50,60 Z" />
                <path d="M10,40 L10,80 L50,95 L50,60" />
                <path d="M90,40 L90,80 L50,95" />
             </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};