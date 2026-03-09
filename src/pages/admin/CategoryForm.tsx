"use client";

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Image as ImageIcon, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { diamondDebug } from '@/utils/debug';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newSub, setNewSub] = useState({ name: '', image_url: '' });
  
  const { 
    formData, 
    setFormData, 
    subcategories, 
    setSubcategories, 
    saving, 
    loading, 
    handleSave 
  } = useCategoryForm(id);

  const addSub = () => {
    if (!newSub.name.trim()) return;
    
    const subId = newSub.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''); 

    if (subcategories.find(s => s.id === subId)) {
      toast.error("Esta subcategoria já existe.");
      return;
    }

    setSubcategories([...subcategories, { 
      id: subId, 
      name: newSub.name.trim(), 
      image_url: newSub.image_url.trim(),
      is_featured: false
    }]);
    setNewSub({ name: '', image_url: '' });
  };

  const toggleFeatured = (idToToggle: string) => {
    const sub = subcategories.find(s => s.id === idToToggle);
    const newState = !sub?.is_featured;
    
    diamondDebug('info', `Clique no destaque detectado para: ${sub?.name}`, {
      id: idToToggle,
      estado_anterior: sub?.is_featured,
      novo_estado_local: newState
    });

    setSubcategories(subcategories.map(s => 
      s.id === idToToggle ? { ...s, is_featured: newState } : s
    ));
  };

  const removeSub = (idToRemove: string) => {
    setSubcategories(subcategories.filter(s => s.id !== idToRemove));
  };

  const updateSubImage = (idToUpdate: string, url: string) => {
    setSubcategories(subcategories.map(s => s.id === idToUpdate ? { ...s, image_url: url } : s));
  };

  if (loading) return <AdminLayout title="Carregando...">...</AdminLayout>;

  return (
    <AdminLayout title={id ? "Editar Nicho" : "Novo Nicho"}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Dados do Nicho</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="text-sm font-bold text-gray-600">Nicho Ativado na Loja</span>
                <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Banners Publicitários</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <ImageIcon size={14} /> Banner da Landing Page
                </Label>
                <Input value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12" />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <ImageIcon size={14} /> Banner Principal (Home do Nicho)
                </Label>
                <Input value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Nome</Label>
                  <Input 
                    value={newSub.name} 
                    onChange={e => setNewSub({ ...newSub, name: e.target.value })} 
                    placeholder="Nome da subcategoria..." 
                    className="rounded-xl h-10 text-xs" 
                    onKeyPress={(e) => e.key === 'Enter' && addSub()}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">URL da Imagem</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={newSub.image_url} 
                      onChange={e => setNewSub({ ...newSub, image_url: e.target.value })} 
                      placeholder="https://..." 
                      className="rounded-xl h-10 text-xs flex-1" 
                    />
                    <Button onClick={addSub} className="bg-gray-900 rounded-xl px-4 h-10 text-white"><Plus size={18}/></Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {subcategories.map(s => (
                  <div key={s.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFeatured(s.id)}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            s.is_featured ? "bg-amber-50 text-amber-500" : "text-gray-300 hover:text-amber-400"
                          )}
                          title={s.is_featured ? "Remover do destaque" : "Colocar em destaque na Home"}
                        >
                          <Star size={16} fill={s.is_featured ? "currentColor" : "none"} />
                        </button>
                        <span className="text-xs font-bold text-gray-700">{s.name}</span>
                      </div>
                      <button onClick={() => removeSub(s.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                        {s.image_url ? (
                          <img src={s.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={14} className="text-gray-200" />
                        )}
                      </div>
                      <Input 
                        value={s.image_url} 
                        onChange={(e) => updateSubImage(s.id, e.target.value)}
                        placeholder="URL da imagem..." 
                        className="h-8 text-[10px] rounded-lg bg-gray-50/50 border-gray-100 flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={() => handleSave(() => navigate('/adm/categorias'))} 
          disabled={saving} 
          className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-16 font-bold uppercase text-sm tracking-widest text-white shadow-xl shadow-[#B89C6A]/20"
        >
          <Save size={20} className="mr-2" /> {saving ? 'SALVANDO...' : 'SALVAR NO BANCO'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;