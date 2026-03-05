"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Image as ImageIcon, Save, DollarSign, Truck, Layers, Info, Barcode, HelpCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductVariation } from '@/types/store';
import { toast } from 'sonner';
import { usePersistence } from '@/hooks/usePersistence';

const initialFormData = {
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
};

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [availableVariations, setAvailableVariations] = useState<ProductVariation[]>([]);

  // 1. Persistência de dados (Draft)
  const persistenceKey = id ? `edit_product_${id}` : 'new_product_draft';
  const { data: formData, updateField, setData: setFormData } = usePersistence<any>(persistenceKey, initialFormData);

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
    if (vars) setAvailableVariations(vars || []);
  };

  const fetchProduct = async () => {
    const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
    if (prod) {
      // Mescla dados do banco com o rascunho salvo (priorizando rascunho se houver)
      setFormData((prev: any) => ({ ...prod, ...prev }));
    }

    const { data: links } = await supabase.from('product_variations_link').select('variation_id').eq('product_id', id);
    if (links) setSelectedVariations(links.map(l => l.variation_id));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_mother_id) {
      toast.error("Preencha os campos obrigatórios (Nome, Preço de Venda e Nicho)");
      return;
    }

    setSaving(true);
    try {
      const { data: savedProd, error: prodError } = await supabase
        .from('products')
        .upsert(formData)
        .select()
        .single();

      if (prodError) throw prodError;

      if (savedProd) {
        await supabase.from('product_variations_link').delete().eq('product_id', savedProd.id);
        if (selectedVariations.length > 0) {
          const { error: varError } = await supabase
            .from('product_variations_link')
            .insert(selectedVariations.map(vId => ({ product_id: savedProd.id, variation_id: vId })));
          if (varError) throw varError;
        }
      }

      toast.success("Produto salvo com sucesso!");
      localStorage.removeItem(`form_data_${persistenceKey}`); // Limpa rascunho após salvar
      navigate('/adm/produtos');
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedNiche = categories.find(c => c.id === formData.category_mother_id);

  return (
    <AdminLayout 
      title={id ? "Editar Produto" : "Novo Produto"}
      actions={
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => navigate('/adm/produtos')} className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest">Cancelar</Button>
           <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-black rounded-full px-12 h-11 font-bold uppercase text-[10px] tracking-widest">
            {saving ? 'Gravando...' : 'Salvar'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Informações Gerais */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50">
              <CardTitle className="text-sm font-bold text-gray-700">Detalhes do produto</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Disponível para venda <HelpCircle size={14} className="inline ml-1 text-gray-300" /></Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={formData.is_active} onCheckedChange={v => updateField('is_active', v)} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formData.is_active ? 'SIM' : 'NÃO'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Nome do produto</Label>
                  <Input value={formData.name} onChange={e => updateField('name', e.target.value)} className="rounded-xl h-12 bg-gray-50/50 border-gray-100" />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                  <Textarea value={formData.description} onChange={e => updateField('description', e.target.value)} className="rounded-xl min-h-[150px] bg-gray-50/50 border-gray-100" />
                </div>
              </div>

              {/* Precificação Padrão Yampi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Preço de custo <span className="text-gray-400 text-xs font-normal">(opcional)</span></Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
                    <Input 
                      type="number" 
                      value={formData.cost_price} 
                      onChange={e => updateField('cost_price', Number(e.target.value))} 
                      className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Preço de venda</Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => updateField('price', Number(e.target.value))} 
                      className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Preço promocional <span className="text-gray-400 text-xs font-normal">(opcional)</span></Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
                    <Input 
                      type="number" 
                      value={formData.promo_price} 
                      onChange={e => updateField('promo_price', Number(e.target.value))} 
                      className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Códigos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Código SKU <HelpCircle size={14} className="inline ml-1 text-gray-300" /></Label>
                  <div className="flex gap-2">
                    <Input value={formData.sku} onChange={e => updateField('sku', e.target.value)} className="rounded-xl h-12 bg-gray-50/50 border-gray-100" />
                    <Button variant="secondary" className="rounded-xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest">GERAR</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Código de Barras (EAN-13) <span className="text-gray-400 text-xs font-normal">(opcional)</span> <HelpCircle size={14} className="inline ml-1 text-gray-300" /></Label>
                  <Input value={formData.barcode} onChange={e => updateField('barcode', e.target.value)} className="rounded-xl h-12 bg-gray-50/50 border-gray-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peso e Dimensões Padrão Yampi */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-700">Peso e Dimensões</CardTitle>
              <button className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-2">
                <Truck size={14} /> Dúvidas gerais sobre frete
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Peso</Label>
                    <div className="relative flex items-center">
                      <Input 
                        type="number" 
                        value={formData.weight} 
                        onChange={e => updateField('weight', Number(e.target.value))} 
                        className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100" 
                      />
                      <div className="absolute right-4 font-bold text-gray-900 text-sm">Kg</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Largura</Label>
                      <span className="text-[9px] font-bold text-[#B89C6A] bg-[#B89C6A]/10 px-2 py-0.5 rounded-full uppercase">= 0,00 m</span>
                    </div>
                    <div className="relative flex items-center">
                      <Input 
                        type="number" 
                        value={formData.width} 
                        onChange={e => updateField('width', Number(e.target.value))} 
                        className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100" 
                      />
                      <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Altura</Label>
                      <span className="text-[9px] font-bold text-[#B89C6A] bg-[#B89C6A]/10 px-2 py-0.5 rounded-full uppercase">= 0,00 m</span>
                    </div>
                    <div className="relative flex items-center">
                      <Input 
                        type="number" 
                        value={formData.height} 
                        onChange={e => updateField('height', Number(e.target.value))} 
                        className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100" 
                      />
                      <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-gray-600">Comprimento</Label>
                      <span className="text-[9px] font-bold text-[#B89C6A] bg-[#B89C6A]/10 px-2 py-0.5 rounded-full uppercase">= 0,00 m</span>
                    </div>
                    <div className="relative flex items-center">
                      <Input 
                        type="number" 
                        value={formData.length} 
                        onChange={e => updateField('length', Number(e.target.value))} 
                        className="pr-12 rounded-xl h-12 bg-gray-50/50 border-gray-100" 
                      />
                      <div className="absolute right-4 font-bold text-gray-900 text-sm">cm</div>
                    </div>
                  </div>
                </div>

                {/* Ilustração da Caixa */}
                <div className="hidden md:flex w-48 h-48 items-center justify-center border border-gray-50 rounded-3xl p-4">
                   <div className="relative w-full h-full opacity-20">
                     <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-900 stroke-[1]">
                        <path d="M10,40 L50,20 L90,40 L50,60 Z" />
                        <path d="M10,40 L10,80 L50,95 L50,60" />
                        <path d="M90,40 L90,80 L50,95" />
                     </svg>
                     <span className="absolute -left-2 top-1/2 text-[8px] font-bold uppercase rotate-90">Comprimento</span>
                     <span className="absolute -right-2 top-1/2 text-[8px] font-bold uppercase -rotate-90">Altura</span>
                     <span className="absolute bottom-0 right-1/4 text-[8px] font-bold uppercase">Largura</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variações do Produto (Centralizado) */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
             <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold text-gray-700">Variações do produto</CardTitle>
               <button className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A]">Veja como cadastrar variações</button>
             </CardHeader>
             <CardContent className="p-8">
               <p className="text-sm text-gray-400 mb-8 max-w-2xl">
                 Seu produto possui variações como de tamanho, cor, material, etc? Se sim, adicione as variações clicando abaixo e fazendo edições necessárias logo após.
               </p>

               {availableVariations.length === 0 ? (
                 <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                   <p className="text-sm text-amber-700 font-medium">Nenhuma variação global cadastrada.</p>
                   <Link to="/adm/variacoes/novo">
                     <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100 h-9 rounded-full px-6 text-xs font-bold uppercase tracking-widest">Cadastrar Variação Primeiro</Button>
                   </Link>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {availableVariations.map(v => (
                     <label key={v.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${selectedVariations.includes(v.id) ? 'bg-[#B89C6A]/10 border-[#B89C6A]' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                       <input 
                         type="checkbox" 
                         checked={selectedVariations.includes(v.id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedVariations([...selectedVariations, v.id]);
                           else setSelectedVariations(selectedVariations.filter(id => id !== v.id));
                         }}
                         className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" 
                       />
                       <div>
                         <p className="text-xs font-bold text-gray-900">{v.name}</p>
                         <p className="text-[9px] text-gray-400 uppercase font-mono">{v.options.length} opções</p>
                       </div>
                     </label>
                   ))}
                 </div>
               )}
             </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-50">
               <CardTitle className="text-sm font-bold text-gray-700">Categorização</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Nicho / Categoria Mãe</Label>
                <select 
                  value={formData.category_mother_id} 
                  onChange={e => updateField('category_mother_id', e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 px-4 text-sm outline-none focus:ring-1 focus:ring-[#B89C6A]"
                >
                  <option value="">Selecione o Nicho</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Subcategoria</Label>
                <select 
                  value={formData.subcategory_id} 
                  onChange={e => updateField('subcategory_id', e.target.value)} 
                  disabled={!formData.category_mother_id} 
                  className="w-full h-12 rounded-xl bg-gray-50 border-gray-100 px-4 text-sm outline-none focus:ring-1 focus:ring-[#B89C6A] disabled:opacity-50"
                >
                  <option value="">Selecione a Subcategoria</option>
                  {selectedNiche?.subcategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-gray-500">Estoque Geral</Label>
                <Input type="number" value={formData.stock} onChange={e => updateField('stock', Number(e.target.value))} className="rounded-xl h-12 bg-gray-50 border-gray-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
             <CardHeader className="bg-white border-b border-gray-50">
               <CardTitle className="text-sm font-bold text-gray-700">Mídia Principal</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group relative">
                 {formData.main_image ? (
                   <>
                    <img src={formData.main_image} className="w-full h-full object-cover" />
                    <button onClick={() => updateField('main_image', '')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                   </>
                 ) : (
                   <div className="text-center p-6">
                     <ImageIcon size={40} className="text-gray-200 mx-auto mb-2" />
                     <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhuma imagem selecionada</p>
                   </div>
                 )}
               </div>
               <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-gray-500">URL da Imagem</Label>
                 <Input value={formData.main_image} onChange={e => updateField('main_image', e.target.value)} placeholder="https://..." className="rounded-xl h-10 text-xs bg-gray-50 border-gray-100" />
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;