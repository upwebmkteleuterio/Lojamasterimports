import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ProductVariation } from '@/types/store';

interface VariationsSectionProps {
  availableVariations: ProductVariation[];
  selectedVariations: string[];
  onToggle: (variationId: string) => void;
}

export const VariationsSection = ({ availableVariations, selectedVariations, onToggle }: VariationsSectionProps) => {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-700">Variações do produto</CardTitle>
        <button className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A]">Veja como cadastrar variações</button>
      </CardHeader>
      <CardContent className="p-8">
        <p className="text-sm text-gray-400 mb-8 max-w-2xl">
          Seu produto possui variações como de tamanho, cor, material, etc? Se sim, adicione as variações clicando abaixo.
        </p>

        {availableVariations.length === 0 ? (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
            <p className="text-sm text-amber-700 font-medium">Nenhuma variação global cadastrada.</p>
            <Link to="/adm/variacoes/novo">
              <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100 h-9 rounded-full px-6 text-xs font-bold uppercase tracking-widest">Cadastrar Variação Primeiro</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableVariations.map(v => (
              <label key={v.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${selectedVariations.includes(v.id) ? 'bg-[#B89C6A]/10 border-[#B89C6A]' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                <input 
                  type="checkbox" 
                  checked={selectedVariations.includes(v.id)}
                  onChange={() => onToggle(v.id)}
                  className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" 
                />
                <div>
                  <p className="text-xs font-bold text-gray-900">{v.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase font-mono">{v.options.length} opções</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};