"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Star, Image as ImageIcon, Link as LinkIcon, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getSafeProductImage } from '@/utils/imageHandler';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newSub, setNewSub] = useState({ name: '', image_url: '' });
  const [isIdManual, setIsIdManual] = useState(false);
  
  const { 
    formData, setFormData, 
    subcategories, setSubcategories, 
    saving, loading, 
    handleSave, deleteSubcategoryManual 
  } = useCategoryForm(id);

  // Função para transformar texto em ID (URL amigável)
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\s+/g, '-')           // Troca espaços por -
      .replace(/[^a-z0-9-]/g, '');    // Remove caracteres especiais
  };

  const handleNameChange = (val: string) => {
    setFormData({ ...formData, name: val });
    // Se for novo e o usuário não editou o ID manualmente, gera o ID
    if (!id && !isIdManual) {
      setFormData(prev => ({ ...prev, name: val, id: slugify(val) }));
    }
  };

  const addSub = () => {
    if (!newSub.name.trim()) {
      toast.error("Dê um nome para a categoria.");
      return;
    }
    if (!formData.id) {
      toast.error("Defina primeiro o ID do nicho.");
      return;
    }

    const slug = slugify(newSub.name.trim()); 
    const fullId = `${formData.id}-${slug}`;
    
    if (subcategories.find(s => s.id === fullId)) {
      toast.error("Esta categoria já existe.");
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

  const updateSubField = (subId: string, field: 'name' | 'image_url', value: string) => {
    setSubcategories(subcategories.map(sub => 
      sub.id === subId ? { ...sub, [field]: value } : sub
    ));
  };

  const removeSub = async (subId: string) => {
    if (!subId.includes(formData.id)) {
      setSubcategories(subcategories.filter(s => s.id !== subId));
      return;
    }
    if (window.confirm("Deseja excluir permanentemente esta categoria do banco?")) {
      await deleteSubcategoryManual(subId);
    }
  };

  return (
    <AdminLayout 
      title={id ? "Configurar Nicho" : "Novo Nicho"}
      actions={
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => navigate('/adm/categorias')} className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest text-gray-400">Cancelar</Button>
           <Button 
            onClick={() => handleSave(() => navigate('/adm/categorias'))} 
            disabled={saving || !formData.id} 
            className="bg-black hover:bg-gray-800 rounded-full px-10 h-11 font-bold uppercase text-[10px] tracking-widest text-white shadow-lg"
          >
            <Save size={16} className="mr-2" /> {saving ? 'GRAVANDO...' : 'SALVAR NO BANCO'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Configurações do Nicho */}
        <div className="lg:col-span-6 space-y-8">
          <Card className="rounded-[40px] border-none shadow-sm bg-white p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B89C6A]">
                <ImageIcon size={14} /> Identidade Visual do Nicho
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400 ml-4">Nome Exibido</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => handleNameChange(e.target.value)} 
                    placeholder="Ex: Pet Shop"
                    className="rounded-2xl h-14 bg-gray-50 border-gray-100 px-6 font-bold" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400 ml-4 flex items-center gap-2">
                    URL do Nicho (ID Único) <Globe size={12} className="text-blue-400" />
                  </Label>
                  <div className="relative">
                    <Input 
                      value={formData.id} 
                      onChange={e => {
                        setFormData({ ...formData, id: slugify(e.target.value) });
                        setIsIdManual(true);
                      }} 
                      disabled={!!id} // Bloqueia edição se o nicho já existir no banco
                      placeholder="nicho-exemplo"
                      className={cn(
                        "rounded-2xl h-14 bg-gray-50 border-gray-100 px-6 font-mono text-xs",
                        id && "opacity-50 cursor-not-allowed"
                      )} 
                    />
                    {!id && (
                      <p className="mt-2 text-[9px] text-gray-400 ml-4 italic">
                        Este será o link da loja (ex: sualoja.com/<strong>{formData.id || '...'}</strong>)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Label className="text-[10px] font-bold uppercase text-gray-400 ml-4">Banner da Home (URL)</Label>
                  <Input value={formData.home_hero_banner} onChange={e => setFormData({...formData, home_hero_banner: e.target.value})} placeholder="Link da imagem 1920x650..." className="rounded-2xl h-14 bg-gray-50 border-gray-100 px-6" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-gray-400 ml-4">Banner da Landing (URL)</Label>
                  <Input value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} placeholder="Link da imagem vertical..." className="rounded-2xl h-14 bg-gray-50 border-gray-100 px-6" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coluna Categorias Internas */}
        <div className="lg:col-span-6 space-y-8">
          <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden flex flex-col h-full">
            <CardHeader className="bg-gray-50/50 border-b p-8">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Categorias de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Adicionar Nova Categoria */}
              <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-gray-100">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Criar Nova Categoria</p>
                <div className="grid grid-cols-1 gap-3">
                  <Input 
                    value={newSub.name} 
                    onChange={e => setNewSub({...newSub, name: e.target.value})} 
                    placeholder="Nome da Categoria (ex: Brincos)" 
                    className="rounded-xl h-12 bg-white border-gray-100 px-4" 
                  />
                  <div className="flex gap-2">
                    <Input 
                      value={newSub.image_url} 
                      onChange={e => setNewSub({...newSub, image_url: e.target.value})} 
                      placeholder="URL da Imagem..." 
                      className="rounded-xl h-12 bg-white border-gray-100 px-4 flex-1" 
                    />
                    <Button onClick={addSub} className="bg-black hover:bg-gray-800 rounded-xl px-6 h-12"><Plus size={20}/></Button>
                  </div>
                </div>
              </div>
              
              {/* Lista de Categorias */}
              <div className="space-y-4">
                {subcategories.map(s => (
                  <div key={s.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex flex-col gap-4 group hover:border-[#B89C6A]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail Preview */}
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        <img src={getSafeProductImage(s.image_url)} className="w-full h-full object-cover" alt="" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input 
                            value={s.name} 
                            onChange={(e) => updateSubField(s.id, 'name', e.target.value)} 
                            className="h-8 text-sm bg-transparent border-none p-0 font-bold focus-visible:ring-0 text-gray-900" 
                          />
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setSubcategories(subcategories.map(sub => sub.id === s.id ? {...sub, is_featured: !sub.is_featured} : sub))}
                              className={cn("p-2 rounded-full transition-colors", s.is_featured ? "bg-amber-50 text-amber-500" : "text-gray-200 hover:text-gray-400")}
                              title="Destaque na Home"
                            >
                               <Star size={18} fill={s.is_featured ? "currentColor" : "none"} />
                            </button>
                            <button onClick={() => removeSub(s.id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50/50 rounded-xl px-3 py-1.5 border border-gray-50">
                          <LinkIcon size={12} className="text-gray-300" />
                          <Input 
                            value={s.image_url} 
                            onChange={(e) => updateSubField(s.id, 'image_url', e.target.value)} 
                            placeholder="URL da Imagem..."
                            className="h-6 text-[10px] bg-transparent border-none p-0 focus-visible:ring-0 text-gray-400 italic" 
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