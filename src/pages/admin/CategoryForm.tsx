"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon, ArrowLeft, Save, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '@/services/persistence';
import { CategoryMotherData } from '@/types/store';
import { toast } from 'sonner';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CategoryMotherData>({
    id: '',
    name: '',
    active: true,
    landingBanner: '',
    homeHeroBanner: '',
    subcategories: []
  });

  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    if (id) {
      const saved = getStorageItem<CategoryMotherData[]>('mother_categories') || [];
      const found = saved.find(c => c.id === id);
      if (found) setFormData(found);
    }
  }, [id]);

  const addSubcategory = () => {
    if (!newSubName.trim()) return;
    const newId = newSubName.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (formData.subcategories.some(s => s.id === newId)) {
      toast.error("Esta subcategoria já existe");
      return;
    }

    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, { id: newId, name: newSubName, image: '' }]
    });
    setNewSubName('');
  };

  const removeSubcategory = (subId: string) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter(s => s.id !== subId)
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.id) {
      toast.error("Nome e ID são obrigatórios");
      return;
    }

    const saved = getStorageItem<CategoryMotherData[]>('mother_categories') || [];
    let updated;

    if (id) {
      updated = saved.map(c => c.id === id ? formData : c);
    } else {
      if (saved.some(c => c.id === formData.id)) {
        toast.error("Este ID de nicho já está em uso");
        return;
      }
      updated = [...saved, formData];
    }

    setStorageItem('mother_categories', updated);
    toast.success("Nicho salvo com sucesso");
    navigate('/adm/categorias');
  };

  return (
    <AdminLayout 
      title={id ? `Editar: ${formData.name}` : "Novo Nicho / Categoria Mãe"}
      actions={
        <Button onClick={handleSave} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest gap-2">
          <Save size={18} /> Salvar Alterações
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Dados e Banners */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Nome do Nicho</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Mundo Pet"
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12 focus-visible:ring-[#B89C6A]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">ID (URL)</Label>
                  <Input 
                    disabled={!!id}
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    placeholder="ex: pet"
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12 focus-visible:ring-[#B89C6A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Status do Nicho</p>
                  <p className="text-xs text-gray-400">Ative ou desative este nicho na loja.</p>
                </div>
                <Switch 
                  checked={formData.active} 
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Banners (URLs)</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} /> Banner da Landing Page
                </Label>
                <Input 
                  value={formData.landingBanner}
                  onChange={(e) => setFormData({...formData, landingBanner: e.target.value})}
                  placeholder="https://imagem.com/banner-landing.jpg"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12 focus-visible:ring-[#B89C6A]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} /> Hero Banner da Home (Nicho)
                </Label>
                <Input 
                  value={formData.homeHeroBanner}
                  onChange={(e) => setFormData({...formData, homeHeroBanner: e.target.value})}
                  placeholder="https://imagem.com/hero-home.jpg"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12 focus-visible:ring-[#B89C6A]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: Subcategorias */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white sticky top-24">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Layers size={16} /> Subcategorias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-2 mb-6">
                <Input 
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Nova sub..."
                  className="rounded-xl border-gray-100 bg-gray-50 h-10 text-xs"
                />
                <Button onClick={addSubcategory} className="h-10 w-10 p-0 bg-gray-900 rounded-xl">
                  <Plus size={18} />
                </Button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {formData.subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{sub.name}</p>
                      <p className="text-[9px] text-gray-400 font-mono">ID: {sub.id}</p>
                    </div>
                    <button 
                      onClick={() => removeSubcategory(sub.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {formData.subcategories.length === 0 && (
                  <p className="text-center text-xs text-gray-300 py-8 italic">Nenhuma subcategoria.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;