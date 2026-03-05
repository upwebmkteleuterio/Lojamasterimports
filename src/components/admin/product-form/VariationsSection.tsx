"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit3, Trash2, ChevronDown } from 'lucide-react';
import { ProductVariation, ProductVariant } from '@/types/store';
import { VariantEditModal } from './VariantEditModal';
import { cn } from '@/lib/utils';

interface VariationsSectionProps {
  availableVariations: ProductVariation[];
  variants: ProductVariant[];
  onUpdateVariants: (variants: ProductVariant[]) => void;
  mainProductData: any;
}

export const VariationsSection = ({ availableVariations, variants, onUpdateVariants, mainProductData }: VariationsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState<ProductVariation | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const filteredAttrs = availableVariations.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAttr = (attr: ProductVariation) => {
    setSelectedAttr(attr);
    setSearchTerm("");
    setShowDropdown(false);
    setSelectedOptions([]);
  };

  const handleToggleOption = (opt: string) => {
    setSelectedOptions(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleGenerateVariants = () => {
    if (!selectedAttr) return;
    
    const newVariants: ProductVariant[] = selectedOptions.map(opt => ({
      attribute_name: selectedAttr.name,
      option_name: opt,
      sku: `${mainProductData.sku || 'SKU'}-${opt.toUpperCase()}`,
      barcode: mainProductData.barcode || '',
      price: mainProductData.price || 0,
      cost_price: mainProductData.cost_price || 0,
      promo_price: mainProductData.promo_price || 0,
      stock: 0,
      main_image: '',
      weight: mainProductData.weight || 0,
      height: mainProductData.height || 0,
      width: mainProductData.width || 0,
      length: mainProductData.length || 0,
      is_active: true
    }));

    onUpdateVariants([...variants, ...newVariants]);
    setSelectedAttr(null);
    setSelectedOptions([]);
  };

  const handleSaveEditedVariant = (updated: ProductVariant) => {
    const next = [...variants];
    next[editIndex] = updated;
    onUpdateVariants(next);
    setEditingVariant(null);
  };

  const removeVariant = (index: number) => {
    onUpdateVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-700">Variações do produto</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        
        {/* Seletor de Nova Variação */}
        <div className="space-y-4 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nova variação</p>
          <p className="text-[11px] text-gray-400">O que está variando no seu produto? Ex: tamanho, cor, material etc.</p>
          
          <div className="relative">
            <div className="flex gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input 
                    value={selectedAttr ? selectedAttr.name : searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      if (selectedAttr) setSelectedAttr(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar ou cadastrar..."
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50"
                  />
               </div>
               {selectedAttr && (
                 <Button onClick={handleGenerateVariants} disabled={selectedOptions.length === 0} className="bg-gray-900 rounded-2xl h-14 px-8 font-bold text-xs uppercase tracking-widest">Salvar</Button>
               )}
            </div>

            {showDropdown && !selectedAttr && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 py-2 max-h-60 overflow-y-auto">
                {filteredAttrs.length > 0 ? filteredAttrs.map(attr => (
                  <button 
                    key={attr.id}
                    onClick={() => handleSelectAttr(attr)}
                    className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {attr.name}
                  </button>
                )) : (
                  <div className="px-6 py-3 text-sm text-gray-400 italic">Nenhum atributo encontrado...</div>
                )}
              </div>
            )}
          </div>

          {selectedAttr && (
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-4">Selecione as opções de {selectedAttr.name}:</p>
              <div className="flex flex-wrap gap-2">
                {selectedAttr.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleToggleOption(opt)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                      selectedOptions.includes(opt) 
                        ? "bg-gray-900 border-gray-900 text-white" 
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Variantes Geradas */}
        {variants.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-gray-50">
            <h3 className="text-sm font-bold text-gray-700">Detalhes das opções</h3>
            <div className="border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                    <th className="px-6 py-4">Opções</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4">Disponível</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{v.attribute_name}:</span> <span className="font-bold text-gray-900">{v.option_name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500 uppercase">{v.sku || '--'}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={v.is_active ? "bg-green-500" : "bg-gray-200"}>{v.is_active ? 'SIM' : 'NÃO'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingVariant(v);
                              setEditIndex(idx);
                            }}
                            className="h-8 rounded-lg border-gray-100 text-gray-500 hover:text-[#B89C6A] hover:border-[#B89C6A]"
                           >
                            <Edit3 size={12} className="mr-1" /> Editar
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeVariant(idx)}
                            className="h-8 w-8 text-gray-300 hover:text-red-500"
                           >
                            <Trash2 size={14} />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editingVariant && (
          <VariantEditModal 
            isOpen={true}
            variant={editingVariant}
            mainProductData={mainProductData}
            onClose={() => setEditingVariant(null)}
            onSave={handleSaveEditedVariant}
          />
        )}
      </CardContent>
    </Card>
  );
};