"use client";

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Image as ImageIcon, Star, Type } from 'lucide-react';
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

  const onSaveClick = () => {
    diamondDebug('info', 'ACIONANDO SALVAMENTO PELO TOPO');
    handleSave(() => {
      navigate('/adm/categorias');
    });
  };

  const addSub = () => {
    if (!newSub.name.trim()) return;
    
    // Gera um slug limpo para o ID interno, mantendo o nome original com barras se o usuário quiser
    const slug = newSub.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''); 
    
    const fullId = `${formData.id}-${slug}`;

    if (subcategories.find(s => s.id === fullId)) {
      toast.error("Esta subcategoria já existe.");
      return;
    }

    setSubcategories([...subcategories, { 
      id: fullId, 
      name: newSub.name.trim(), 
      image_url: newSub.image_url.trim(),
      is_featured: false
    }]);
    setNewSub({ name: '', image_url: '' });
  };

  const toggleFeatured = (idToToggle: string) => {
    setSubcategories(prev => prev.map(s => {
      if (s.id === idToToggle) {
        const next = !s.is_featured;
        diamondDebug('info', `Destaque: ${s.name} -> ${next}`);
        return { ...s, is_featured: next };
      }
      return s;
    }));
  };

  const removeSub = (idToRemove: string) => {
    setSubcategories(subcategories.filter(s => s.id !== idToRemove));
  };

  const updateSubField = (idToUpdate: string, field: 'name' | 'image_url', value: string) => {
    setSubcategories(subcategories.map(s => s.id === idToUpdate ? { ...s, [field]: value } : s));
  };

  if (loading) return <AdminLayout title="Carregando...">...</AdminLayout>;

  return (
    <AdminLayout 
      title={id ? "Editar Nicho" : "Novo Nicho"}
      actions={
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => navigate('/adm/categorias')} className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest">Voltar</Button>
           <Button 
            onClick={onSaveClick} 
            disabled={saving} 
            className="bg-gray-900 hover:bg-black rounded-full px-8 h-11 font-bold uppercase text-[10px] tracking-widest text-white shadow-lg"
          >
            <Save size={16} className="mr-2" /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Identificação do Nicho</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Nome da Categoria Mãe</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Cuidados Femininos" className="rounded-2xl h-12 bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-500">Slug / URL (Identificador)</Label>
                  <Input disabled={!!id} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="ex: cuidados-femininos" className="rounded-2xl h-12 bg-gray-50/50" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-sm font-bold text-gray-600">Categoria Ativa na Loja</span>
                <Switch checked={formData.is_active} onCheckedChange={val => setFormData({...formData, is_active: val})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Banners de Design</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-500">Banner da Landing Page (Vertical)</Label>
                <div className="flex gap-4">
                   <div className="w-16 h-16 rounded-xl bg-gray-50 border overflow-hidden flex-shrink-0">
                      <img src={formData.landing_banner || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                   </div>
                   <Input value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12 bg-gray-50/50 flex-1" />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-500">Banner Hero da Home (Horizontal)</Label>
                <div className="flex gap-4">
                   <div className="w-16 h-16 rounded-xl bg-gray-50 border overflow-hidden flex-shrink-0">
                      <img src={formData.home_hero_banner || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                   </div>
                   <Input value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} placeholder="https://..." className="rounded-2xl h-12 bg-gray-50/50 flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Subcategorias */}
        <div className="lg:col-span-5">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Subcategorias Internas</CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold">{subcategories.length}</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-[#B89C6A]/5 p-5 rounded-2xl border border-dashed border-[#B89C6A]/20 space-y-4">
                <p className="text-[10px] font-bold text-[#B89C6A] uppercase tracking-widest">Adicionar Nova</p>
                <Input 
                  value={newSub.name} 
                  onChange={e => setNewSub({ ...newSub, name: e.target.value })} 
                  placeholder="Nome da Subcategoria..." 
                  className="rounded-xl h-10 text-xs bg-white border-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && addSub()}
                />
                <div className="flex gap-2">
                  <Input 
                    value={newSub.image_url} 
                    onChange={e => setNewSub({ ...newSub, image_url: e.target.value })} 
                    placeholder="Link da Imagem Ícone..." 
                    className="rounded-xl h-10 text-xs flex-1 bg-white border-gray-100" 
                  />
                  <Button onClick={addSub} className="bg-gray-900 hover:bg-black rounded-xl px-4 h-10 text-white shadow-sm"><Plus size={18}/></Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lista de Categorias (Edite os nomes abaixo)</p>
                {subcategories.length === 0 && <p className="text-center py-10 text-xs text-gray-300 italic">Nenhuma subcategoria vinculada.</p>}
                
                {subcategories.map(s => (
                  <div key={s.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:border-[#B89C6A]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleFeatured(s.id)}
                          className={cn("p-1.5 rounded-lg transition-all", s.is_featured ? "bg-amber-100 text-amber-600" : "text-gray-100 hover:text-amber-400")}
                          title={s.is_featured ? "Destaque ativado" : "Marcar como destaque na home"}
                        >
                          <Star size={16} fill={s.is_featured ? "currentColor" : "none"} />
                        </button>
                        <span className="text-[9px] font-mono text-gray-300 uppercase tracking-tighter">ID: {s.id}</span>
                      </div>
                      <button onClick={() => removeSub(s.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <Type size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <Input 
                          value={s.name} 
                          onChange={(e) => updateSubField(s.id, 'name', e.target.value)}
                          placeholder="Nome da categoria..." 
                          className="h-10 text-xs rounded-xl bg-gray-50/50 border-gray-100 pl-10 focus:bg-white"
                        />
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group relative">
                          <img src={s.image_url || "/placeholder.svg"} className="w-full h-full object-cover" alt="" />
                          {!s.image_url && <ImageIcon className="absolute inset-0 m-auto text-gray-200" size={20} />}
                        </div>
                        <div className="flex-1 relative">
                          <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                          <Input 
                            value={s.image_url} 
                            onChange={(e) => updateSubField(s.id, 'image_url', e.target.value)}
                            placeholder="Link da imagem/ícone..." 
                            className="h-10 text-[9px] rounded-xl bg-gray-50/50 border-gray-100 pl-10 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;