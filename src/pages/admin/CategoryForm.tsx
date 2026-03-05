"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    is_active: true,
    landing_banner: '',
    home_hero_banner: ''
  });

  const [subcategories, setSubcategories] = useState<{id: string, name: string}[]>([]);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const { data: cat, error: catError } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (catError) throw catError;
      if (cat) setFormData(cat);

      const { data: subs, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', id);
      
      if (subError) throw subError;
      if (subs) {
        // Remove o prefixo do ID para exibição limpa na interface
        const prefix = `${id}-`;
        setSubcategories(subs.map(s => ({ 
          id: s.id.startsWith(prefix) ? s.id.slice(prefix.length) : s.id, 
          name: s.name 
        })));
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados da categoria");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.id) {
      toast.error("Nome e ID são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      // 1. Salvar Categoria Mãe
      const { error: catError } = await supabase
        .from('category_mothers')
        .upsert(formData);
      
      if (catError) throw catError;

      // 2. Limpar subcategorias atuais para reinserir (evita IDs órfãos)
      await supabase
        .from('subcategories')
        .delete()
        .eq('mother_id', formData.id);
      
      // 3. Inserir subcategorias com ID prefixado corretamente
      if (subcategories.length > 0) {
        const subsToInsert = subcategories.map(s => {
          const subId = s.id.startsWith(`${formData.id}-`) ? s.id : `${formData.id}-${s.id}`;
          return {
            id: subId,
            name: s.name,
            mother_id: formData.id
          };
        });

        const { error: subError } = await supabase
          .from('subcategories')
          .insert(subsToInsert);
        
        if (subError) throw subError;
      }

      toast.success("Nicho e Subcategorias salvos no banco!");
      navigate('/adm/categorias');
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSub = () => {
    if (!newSubName.trim()) return;
    const subId = newSubName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''); 

    if (subcategories.find(s => s.id === subId)) {
      toast.error("Esta subcategoria já existe");
      return;
    }

    setSubcategories([...subcategories, { id: subId, name: newSubName.trim() }]);
    setNewSubName('');
  };

  const removeSub = (idToRemove: string) => {
    setSubcategories(subcategories.filter(s => s.id !== idToRemove));
  };

  return (
    <AdminLayout title={id ? "Editar Nicho" : "Novo Nicho"}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Dados do Nicho</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Nome do Nicho</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Jóias Femininas" className="rounded-2xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">URL amigável (ID)</Label>
                  <Input disabled={!!id} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="Ex: joias-femininas" className="rounded-2xl h-12" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-sm font-bold">Status Ativo</span>
                <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input value={newSubName} onChange={e => setNewSubName(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSub()} placeholder="Nova sub..." className="rounded-xl h-10" />
                <Button onClick={addSub} className="bg-gray-900 rounded-xl w-10 h-10 p-0 text-white"><Plus size={18}/></Button>
              </div>
              <div className="space-y-2 pt-2">
                {subcategories.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                    <span className="text-xs font-bold text-gray-700">{s.name}</span>
                    <button onClick={() => removeSub(s.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold uppercase text-sm text-white">
          {saving ? 'Salvando...' : 'Salvar no Banco'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;