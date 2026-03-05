"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit3, Trash2, ChevronDown, X } from 'lucide-react';
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

  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    
    // Filtra opções que já existem para não duplicar
    const filteredNewOptions = selectedOptions.filter(opt => 
      !variants.some(v => v.attribute_name === selectedAttr.name && v.option_name === opt)
    );

    const newVariants: ProductVariant[] = filteredNewOptions.map(opt => ({
      attribute_name: selectedAttr.name,
      option_name: opt,
      sku: `${mainProductData.sku || 'SKU'}-${opt.toUpperCase().replace(/\s+/g, '')}`,
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
        <div className="space-y-4 max-w-xl" ref={containerRef}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nova variação</p>
          <p className="text-[11px] text-gray-400">O que está variando no seu produto? Escolha na lista ou digite para buscar.</p>
          
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
                    placeholder="Escolha uma variação (Ex: Cor, Tamanho...)"
                    className="pl-12 pr-10 h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-colors"
                  />
                  <ChevronDown 
                    size={18} 
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none",
                      showDropdown && "rotate-180"
                    )} 
                  />
               </div>
               {selectedAttr && (
                 <Button onClick={handleGenerateVariants} disabled={selectedOptions.length === 0} className="bg-gray-900 hover:bg-black rounded-2xl h-14 px-8 font-bold text-xs uppercase tracking-widest">
                   ADICIONAR
                 </Button>
               )}
            </div>

            {showDropdown && !selectedAttr && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                {filteredAttrs.length > 0 ? (
                  filteredAttrs.map(attr => (
                    <button 
                      key={attr.id}
                      onClick={() => handleSelectAttr(attr)}
                      className="w-full text-left px-6 py-4 text-sm font-medium text-gray-700 hover:bg-[#B89C6A]/5 hover:text-[#B89C6A] transition-colors border-b border-gray-50 last:border-0"
                    >
                      {attr.name}
                      <span className="block text-[10px] text-gray-400 font-normal mt-0.5">Opções: {attr.options.join(', ')}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-6 text-center">
                    <p className="text-sm text-gray-400 italic">Nenhuma variação encontrada com este nome.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedAttr && (
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Selecione as opções de {selectedAttr.name}:</p>
                <button onClick={() => setSelectedAttr(null)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAttr.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleToggleOption(opt)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-xs font-bold transition-all border",
                      selectedOptions.includes(opt) 
                        ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200" 
                        : "bg-white border-gray-200 text-gray-500 hover:border-[#B89C6A] hover:text-[#B89C6A]"
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">Variantes configuradas</h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{variants.length} opções</span>
            </div>
            <div className="border border-gray-100 rounded-3xl overflow-hidden overflow-x-auto bg-gray-50/30">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white border-b border-gray-50 text-[10px] uppercase font-bold text-gray-400">
                    <th className="px-6 py-5">Opção</th>
                    <th className="px-6 py-5">SKU / Código</th>
                    <th className="px-6 py-5">Preço</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-gray-400 font-bold uppercase">{v.attribute_name}</span>
                           <span className="text-sm font-bold text-gray-900">{v.option_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-[11px] text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">{v.sku || '--'}</span>
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                      </td>
                      <td className="px-6 py-5">
                        <Badge className={cn(
                          "border-none rounded-full px-3 text-[9px] font-bold uppercase",
                          v.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        )}>
                          {v.is_active ? 'ATIVO' : 'INATIVO'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingVariant(v);
                              setEditIndex(idx);
                            }}
                            className="h-9 rounded-xl border-gray-100 text-gray-500 hover:text-[#B89C6A] hover:border-[#B89C6A] font-bold uppercase text-[10px]"
                           >
                            <Edit3 size={14} className="mr-2" /> Editar
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeVariant(idx)}
                            className="h-9 w-9 text-gray-300 hover:text-red-500 rounded-xl"
                           >
                            <Trash2 size={16} />
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