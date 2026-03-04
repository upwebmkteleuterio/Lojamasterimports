"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon, Save, DollarSign, Truck, Layers, Info, Barcode } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariation } from '@/types/store';
import { toast } from 'sonner';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [availableVariations, setAvailableVariations] = useState<ProductVariation[]>([]);

  const [formData, setFormData] = useState<any>({
    name: '',
    price: 0,
    cost_price: 0,
    promo_price: 0,
    main_image: '',
    category_mother_id: '',
    subcategory_id: '',
    description: '',
    stock: 0,
    sku: '',
    barcode: '',
    is_active: true,
    weight: 0,
    length: 0,
    width: 0,
    height: 0
  });

  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);

  useEffect(() => {
    fetchSupportData();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchSupportData = async () => {
    const { data: cats } = await supabase.from('category_mothers').select('*, subcategories(*)');
    const { data: vars } = await supabase.from('variations').select('*');
    if (cats) setCategories(cats);
    if (vars) setAvailableVariations(vars);
  };

  const fetchProduct = async () => {
    const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
    if (prod) setFormData(prod);

    const { data: links } = await supabase.from('product_variations_link').select('variation_id').eq('product_id', id);
    if (links) setSelectedVariations(links.map(l => l.variation_id));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_mother_id) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      // 1. Salvar Produto
      const { data: savedProd, error: prodError } = await supabase
        .from('products')
        .upsert(formData)
        .select()
        .single();

      if (prodError) throw prodError;

      // 2. Salvar Vínculos de Variações
      if (savedProd) {
        await supabase.from('product_variations_link').delete().eq('product_id', savedProd.id);
        if (selectedVariations.length > 0) {
          const { error: varError } = await supabase
            .from('product_variations_link')
            .insert(selectedVariations.map(vId => ({ product_id: savedProd.id, variation_id: vId })));
          if (varError) throw varError;
        }
      }

      toast.success("Produto salvo com sucesso no banco!");
      navigate('/adm/produtos');
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedNiche = categories.find(c => c.id === formData.category_mother_id);

  return (
    <AdminLayout title={id ? "Editar Produto" : "Novo Produto"}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome do produto" className="rounded-2xl h-12" />
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descrição" className="rounded-2xl min-h-[150px]" />
              <div className="grid grid-cols-2 gap-6">
                <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="SKU" className="rounded-2xl h-12" />
                <Input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="EAN" className="rounded-2xl h-12" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Precificação</CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-3 gap-6">
              <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="Venda" className="rounded-2xl h-12" />
              <Input type="number" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} placeholder="Custo" className="rounded-2xl h-12" />
              <Input type="number" value={formData.promo_price} onChange={e => setFormData({...formData, promo_price: Number(e.target.value)})} placeholder="Promo" className="rounded-2xl h-12 border-[#B89C6A]/30" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold uppercase">Ativo</span>
                <Switch checked={formData.is_active} onCheckedChange={v => setFormData({...formData, is_active: v})} />
              </div>
              <select value={formData.category_mother_id} onChange={e => setFormData({...formData, category_mother_id: e.target.value, subcategory_id: ''})} className="w-full h-12 rounded-2xl bg-gray-50 border-gray-100 px-4">
                <option value="">Selecione o Nicho</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={formData.subcategory_id} onChange={e => setFormData({...formData, subcategory_id: e.target.value})} disabled={!formData.category_mother_id} className="w-full h-12 rounded-2xl bg-gray-50 border-gray-100 px-4">
                <option value="">Selecione a Subcategoria</option>
                {selectedNiche?.subcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white">
             <CardHeader className="bg-gray-50/50 border-b">
               <CardTitle className="text-sm font-bold uppercase text-gray-400">Mídia Principal</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
                 {formData.main_image ? <img src={formData.main_image} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-200" />}
               </div>
               <Input value={formData.main_image} onChange={e => setFormData({...formData, main_image: e.target.value})} placeholder="URL da imagem" className="rounded-xl h-10 text-xs" />
             </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-gray-400">Variações</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              {availableVariations.map(v => (
                <label key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedVariations.includes(v.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedVariations([...selectedVariations, v.id]);
                      else setSelectedVariations(selectedVariations.filter(id => id !== v.id));
                    }}
                    className="text-[#B89C6A] focus:ring-0" 
                  />
                  <span className="text-xs font-bold text-gray-700">{v.name}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-12 h-14 font-bold uppercase">
          {saving ? 'Gravando...' : 'Salvar no Banco'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
