"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VariationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [currentOption, setCurrentOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVariation();
    }
  }, [id]);

  const fetchVariation = async () => {
    const { data, error } = await supabase
      .from('variations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setName(data.name);
      setOptions(data.options);
    }
  };

  const addOption = () => {
    if (currentOption.trim() && !options.includes(currentOption.trim())) {
      setOptions([...options, currentOption.trim()]);
      setCurrentOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || options.length === 0) {
      toast.error("Preencha o nome e adicione pelo menos uma opção");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('variations')
        .upsert({
          id: id || undefined,
          name,
          options
        });

      if (error) throw error;
      toast.success("Variação salva com sucesso no banco de dados");
      navigate('/adm/variacoes');
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={id ? "Editar Variação" : "Nova Variação"}>
      <div className="max-w-3xl">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome do Atributo</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cor, Tamanho..."
                className="rounded-2xl border-gray-100 bg-gray-50 h-14 text-lg"
              />
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Valores / Opções</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  placeholder="Adicionar valor..."
                  className="rounded-2xl border-gray-100 bg-gray-50 h-14"
                />
                <Button onClick={addOption} className="h-14 w-14 rounded-2xl bg-gray-900"><Plus /></Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="font-medium text-gray-700">{opt}</span>
                    <button onClick={() => removeOption(index)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold text-sm uppercase tracking-widest gap-2">
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar no Banco'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VariationForm;
