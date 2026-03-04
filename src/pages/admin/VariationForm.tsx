"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '@/services/persistence';
import { ProductVariation } from '@/types/store';
import { toast } from 'sonner';

const VariationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [currentOption, setCurrentOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      const saved = getStorageItem<ProductVariation[]>('global_variations') || [];
      const variation = saved.find(v => v.id === id);
      if (variation) {
        setName(variation.name);
        setOptions(variation.options);
      }
    }
  }, [id]);

  const addOption = () => {
    if (currentOption.trim()) {
      if (options.includes(currentOption.trim())) {
        toast.error("Esta opção já foi adicionada");
        return;
      }
      setOptions([...options, currentOption.trim()]);
      setCurrentOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("O nome da variação é obrigatório");
      return;
    }
    if (options.length === 0) {
      toast.error("Adicione pelo menos uma opção");
      return;
    }

    const saved = getStorageItem<ProductVariation[]>('global_variations') || [];
    const newVariation: ProductVariation = {
      id: id || Math.random().toString(36).substr(2, 9),
      name,
      options
    };

    let updated;
    if (id) {
      updated = saved.map(v => v.id === id ? newVariation : v);
    } else {
      updated = [...saved, newVariation];
    }

    setStorageItem('global_variations', updated);
    toast.success("Variação salva com sucesso");
    navigate('/adm/variacoes');
  };

  return (
    <AdminLayout 
      title={id ? "Editar Variação" : "Nova Variação"}
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate('/adm/variacoes')}
          className="rounded-full border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest px-6"
        >
          Cancelar
        </Button>
      }
    >
      <div className="max-w-3xl">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome do Atributo</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cor, Tamanho, Material..."
                className="rounded-2xl border-gray-100 bg-gray-50 h-14 text-lg focus-visible:ring-[#B89C6A]"
              />
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Valores / Opções</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  placeholder="Ex: Azul, 42, Algodão..."
                  className="rounded-2xl border-gray-100 bg-gray-50 h-14 focus-visible:ring-[#B89C6A]"
                />
                <Button 
                  onClick={addOption}
                  className="h-14 w-14 rounded-2xl bg-gray-900 hover:bg-black text-white"
                >
                  <Plus size={24} />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 group animate-in fade-in zoom-in-95">
                    <span className="font-medium text-gray-700">{opt}</span>
                    <button 
                      onClick={() => removeOption(index)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {options.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <p className="text-gray-300 text-sm">Adicione opções acima para sua variação.</p>
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-end">
              <Button 
                onClick={handleSave}
                className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold text-sm uppercase tracking-widest gap-2"
              >
                <Save size={18} /> Salvar Variação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VariationForm;