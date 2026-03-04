"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Layers, Image as ImageIcon } from 'lucide-react';
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
    const { data: cat } = await supabase.from('category_mothers').select('*').eq('id', id).single();
    if (cat) setFormData(cat);

    const { data: subs } = await supabase.from('subcategories').select('*').eq('mother_id', id);
    if (subs) setSubcategories(subs);
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

      // 2. Salvar Subcategorias (As que foram adicionadas ou removidas)
      // Para simplificar: deletamos as atuais e inserimos a lista nova (em um sistema real seria mais granular)
      if (id) {
        await supabase.from('subcategories').delete().eq('mother_id', id);
      }
      
      if (subcategories.length > 0) {
        const { error: subError } = await supabase
          .from('subcategories')
          .insert(subcategories.map(s => ({ ...s, mother_id: formData.id })));
        if (subError) throw subError;
      }

      toast.success("Nicho e Subcategorias salvos no banco!");
      navigate('/adm/categorias');
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSub = () => {
    if (!newSubName.trim()) return;
    const subId = newSubName.toLowerCase().replace(/\s+/g, '-');
    setSubcategories([...subcategories, { id: subId, name: newSubName }]);
    setNewSubName('');
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
                  <Label className="text-xs font-bold uppercase text-gray-500">Nome</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">ID (URL)</Label>
                  <Input disabled={!!id} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="rounded-2xl h-12" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-sm font-bold">Status Ativo</span>
                <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Banners</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Input placeholder="Banner Landing" value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} className="rounded-2xl h-12" />
              <Input placeholder="Hero Home" value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} className="rounded-2xl h-12" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl border-none shadow-sm bg-white sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Nova..." className="rounded-xl h-10" />
                <Button onClick={addSub} className="bg-gray-900 rounded-xl"><Plus size={18}/></Button>
              </div>
              {subcategories.map(s => (
                <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-xl text-xs font-bold">
                  {s.name}
                  <button onClick={() => setSubcategories(subcategories.filter(sub => sub.id !== s.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold">
          {saving ? 'Salvando...' : 'Salvar no Banco'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;
