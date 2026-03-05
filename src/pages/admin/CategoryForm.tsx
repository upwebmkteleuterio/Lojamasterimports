"use client";

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryForm } from '@/hooks/useCategoryForm';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newSubName, setNewSubName] = useState('');
  
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
    if (!newSubName.trim()) return;
    const subId = newSubName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''); 

    if (subcategories.find(s => s.id === subId)) return;
    setSubcategories([...subcategories, { id: subId, name: newSubName.trim() }]);
    setNewSubName('');
  };

  const removeSub = (idToRemove: string) => {
    setSubcategories(subcategories.filter(s => s.id !== idToRemove));
  };

  if (loading) return <AdminLayout title="Carregando...">...</AdminLayout>;

  return (
    <AdminLayout title={id ? "Editar Nicho" : "Novo Nicho"}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo: Dados e Banners */}
        <div className="lg:col-span-8 space-y-8">
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
                  <ImageIcon size={14} /> Banner da Landing Page (Escolha de Nichos)
                </Label>
                <Input value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12" />
                {formData.landing_banner && (
                  <div className="h-32 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={formData.landing_banner} className="w-full h-full object-cover" alt="Landing Preview" />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <Label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                  <ImageIcon size={14} /> Banner Principal (Home do Nicho)
                </Label>
                <Input value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12" />
                {formData.home_hero_banner && (
                  <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={formData.home_hero_banner} className="w-full h-full object-cover" alt="Hero Preview" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Subcategorias */}
        <div className="lg:col-span-4">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex gap-2">
                <Input 
                  value={newSubName} 
                  onChange={e => setNewSubName(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && addSub()} 
                  placeholder="Nova subcategoria..." 
                  className="rounded-xl h-12" 
                />
                <Button onClick={addSub} className="bg-gray-900 rounded-xl w-12 h-12 p-0 text-white"><Plus size={20}/></Button>
              </div>
              
              <div className="space-y-2">
                {subcategories.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400 italic">Nenhuma subcategoria adicionada.</p>
                ) : (
                  subcategories.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                      <span className="text-xs font-bold text-gray-700">{s.name}</span>
                      <button onClick={() => removeSub(s.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))
                )}
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