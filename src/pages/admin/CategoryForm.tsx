"use client";

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Star, Type, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newSub, setNewSub] = useState({ name: '', image_url: '' });
  
  const { 
    formData, setFormData, 
    subcategories, setSubcategories, 
    saving, loading, 
    handleSave, deleteSubcategoryManual 
  } = useCategoryForm(id);

  const addSub = () => {
    if (!newSub.name.trim()) return;
    const slug = newSub.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); 
    const fullId = `${formData.id}-${slug}`;
    if (subcategories.find(s => s.id === fullId)) {
      toast.error("Esta categoria já existe.");
      return;
    }
    setSubcategories([...subcategories, { id: fullId, name: newSub.name.trim(), image_url: newSub.image_url.trim(), is_featured: false }]);
    setNewSub({ name: '', image_url: '' });
  };

  const removeSub = async (subId: string) => {
    // Se a categoria ainda não tem o prefixo do nicho, é porque foi acabada de criar na tela
    if (!subId.includes(formData.id)) {
      setSubcategories(subcategories.filter(s => s.id !== subId));
      return;
    }

    // Se já está no banco, pergunta antes de deletar de verdade
    if (window.confirm("Tem certeza que deseja excluir esta categoria do BANCO DE DADOS?")) {
      await deleteSubcategoryManual(subId);
    }
  };

  return (
    <AdminLayout 
      title={id ? "Editar Nicho" : "Novo Nicho"}
      actions={
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => navigate('/adm/categorias')} className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest text-gray-400">Voltar</Button>
           <Button onClick={() => handleSave(() => navigate('/adm/categorias'))} disabled={saving} className="bg-black hover:bg-gray-800 rounded-full px-10 h-11 font-bold uppercase text-[10px] tracking-widest text-white shadow-lg">
            <Save size={16} className="mr-2" /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="rounded-[32px] border-none shadow-sm bg-white p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-gray-400">Nome do Nicho</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-gray-400">URL Identificadora</Label>
                <Input disabled value={formData.id} className="rounded-2xl h-12 bg-gray-100 border-gray-200" />
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm bg-white p-8 space-y-6">
             <h3 className="text-sm font-bold text-gray-700 mb-4">Design e Banners</h3>
             <div className="space-y-4">
                <Label className="text-[10px] font-bold text-gray-400 uppercase">Banner Principal (URL)</Label>
                <Input value={formData.landing_banner} onChange={e => setFormData({...formData, landing_banner: e.target.value})} className="rounded-xl h-12 bg-gray-50 border-gray-100" />
             </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b p-6">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Categorias Internas</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} placeholder="Nome..." className="rounded-xl h-10 text-xs bg-gray-50 border-gray-100" />
                  <Button onClick={addSub} className="bg-gray-900 rounded-xl px-4 h-10"><Plus size={18}/></Button>
                </div>
                
                <div className="space-y-3">
                  {subcategories.map(s => (
                    <div key={s.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <button onClick={() => setSubcategories(subcategories.map(sub => sub.id === s.id ? {...sub, is_featured: !sub.is_featured} : sub))}>
                           <Star size={16} className={cn("transition-colors", s.is_featured ? "text-amber-500 fill-amber-500" : "text-gray-200")} />
                        </button>
                        <Input value={s.name} onChange={(e) => setSubcategories(subcategories.map(sub => sub.id === s.id ? {...sub, name: e.target.value} : sub))} className="h-8 text-xs bg-transparent border-none p-0 font-bold focus-visible:ring-0" />
                      </div>
                      <button onClick={() => removeSub(s.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CategoryForm;