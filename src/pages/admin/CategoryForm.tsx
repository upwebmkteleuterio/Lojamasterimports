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
    try {
      // 1. Busca Categoria Mãe
      const { data: cat, error: catError } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (catError) throw catError;
      if (cat) setFormData(cat);

      // 2. Busca Subcategorias vinculadas
      const { data: subs, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', id);
      
      if (subError) throw subError;
      if (subs) {
        // Mapeamos para o estado local removendo o prefixo do ID se necessário
        setSubcategories(subs.map(s => ({ 
          id: s.id.includes('-') ? s.id.split('-').slice(1).join('-') : s.id, 
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
      // 1. Salvar/Atualizar Categoria Mãe
      const { error: catError } = await supabase
        .from('category_mothers')
        .upsert(formData);
      
      if (catError) throw catError;

      // 2. Limpar subcategorias antigas deste nicho (para evitar conflitos de ID ou órfãos)
      // Usamos o ID do formData pois ele pode ter sido alterado em um novo cadastro
      const { error: deleteError } = await supabase
        .from('subcategories')
        .delete()
        .eq('mother_id', formData.id);
      
      if (deleteError) throw deleteError;
      
      // 3. Inserir a lista atualizada de subcategorias
      if (subcategories.length > 0) {
        const subsToInsert = subcategories.map(s => ({
          id: `${formData.id}-${s.id}`, // Garantimos ID único combinando Nicho + Sub
          name: s.name,
          mother_id: formData.id
        }));

        const { error: subError } = await supabase
          .from('subcategories')
          .insert(subsToInsert);
        
        if (subError) throw subError;
      }

      toast.success("Nicho e Subcategorias salvos com sucesso!");
      navigate('/adm/categorias');
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar no banco: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSub = () => {
    if (!newSubName.trim()) return;
    const subId = newSubName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''); // remove caracteres especiais

    // Evita duplicados na lista visual
    if (subcategories.find(s => s.id === subId)) {
      toast.error("Esta subcategoria já foi adicionada");
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
                  <Label className="text-xs font-bold uppercase text-gray-500">Nome do Nicho <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: Jóias Femininas"
                    className="rounded-2xl h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">ID da URL <span className="text-red-500">*</span></Label>
                  <Input 
                    disabled={!!id} 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    placeholder="Ex: joias-femininas"
                    className="rounded-2xl h-12" 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold block">Status Ativo</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Exibir nicho na loja</span>
                </div>
                <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Banners e Imagens</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Banner de Entrada (Landing Page)</Label>
                <Input placeholder="URL da imagem..." value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} className="rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Banner Principal (Home do Nicho)</Label>
                <Input placeholder="URL da imagem..." value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} className="rounded-2xl h-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl border-none shadow-sm bg-white sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">Adicione subcategorias para organizar seus produtos dentro deste nicho.</p>
              
              <div className="flex gap-2">
                <Input 
                  value={newSubName} 
                  onChange={e => setNewSubName(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && addSub()}
                  placeholder="Nome da sub..." 
                  className="rounded-xl h-10" 
                />
                <Button onClick={addSub} className="bg-gray-900 hover:bg-black rounded-xl w-10 h-10 p-0 flex items-center justify-center">
                  <Plus size={18}/>
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                {subcategories.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
                    <span className="text-xs font-bold text-gray-700">{s.name}</span>
                    <button 
                      onClick={() => removeSub(s.id)} 
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
                {subcategories.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-2xl">
                    <Layers className="mx-auto text-gray-200 mb-2" size={24} />
                    <p className="text-[10px] text-gray-300 font-bold uppercase">Nenhuma subcategoria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" onClick={() => navigate('/adm/categorias')} className="rounded-full px-8 h-12 font-bold uppercase text-[10px] tracking-widest">Descartar</Button>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold uppercase text-sm tracking-widest gap-2"
        >
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar no Banco'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;