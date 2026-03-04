"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  DollarSign, 
  Truck, 
  Layers, 
  Info, 
  Barcode 
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '@/services/persistence';
import { Product, CategoryMotherData, ProductVariation } from '@/types/store';
import { toast } from 'sonner';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<CategoryMotherData[]>([]);
  const [availableVariations, setAvailableVariations] = useState<ProductVariation[]>([]);

  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    name: '',
    price: 0,
    costPrice: 0,
    promotionalPrice: 0,
    image: '',
    categoryMother: 'feminine',
    subcategory: '',
    description: '',
    stock: 0,
    sku: '',
    barcode: '',
    active: true,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    variations: []
  });

  useEffect(() => {
    // Carregar dados de suporte
    const savedCats = getStorageItem<CategoryMotherData[]>('mother_categories') || [];
    const savedVars = getStorageItem<ProductVariation[]>('global_variations') || [];
    setCategories(savedCats);
    setAvailableVariations(savedVars);

    // Se for edição, carregar o produto
    if (id) {
      const savedProducts = getStorageItem<Product[]>('admin_products') || [];
      const found = savedProducts.find(p => p.id === id);
      if (found) setFormData(found);
    }
  }, [id]);

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.categoryMother) {
      toast.error("Preencha os campos obrigatórios (Nome, Preço e Nicho)");
      return;
    }

    const saved = getStorageItem<Product[]>('admin_products') || [];
    const productToSave = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
    } as Product;

    let updated;
    if (id) {
      updated = saved.map(p => p.id === id ? productToSave : p);
    } else {
      updated = [productToSave, ...saved];
    }

    setStorageItem('admin_products', updated);
    toast.success("Produto salvo com sucesso");
    navigate('/adm/produtos');
  };

  const selectedNiche = categories.find(c => c.id === formData.categoryMother);

  return (
    <AdminLayout 
      title={id ? `Editar: ${formData.name}` : "Novo Produto"}
      actions={
        <Button onClick={handleSave} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest gap-2">
          <Save size={18} /> Salvar Produto
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna Esquerda: Geral e Preços */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Informações Gerais */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Info size={16} /> Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Nome do Produto</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Anel Solitário Diamond Eternal"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12 focus-visible:ring-[#B89C6A]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Descrição</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva os detalhes luxuosos deste produto..."
                  className="rounded-2xl border-gray-100 bg-gray-50 min-h-[150px] focus-visible:ring-[#B89C6A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Barcode size={14}/> SKU</Label>
                  <Input 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="EX: DIAM-001"
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Código de Barras (EAN)</Label>
                  <Input 
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <DollarSign size={16} /> Precificação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Preço de Venda</Label>
                <Input 
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  placeholder="R$ 0,00"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Preço de Custo</Label>
                <Input 
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase text-[#B89C6A]">Preço Promocional</Label>
                <Input 
                  type="number"
                  value={formData.promotionalPrice}
                  onChange={(e) => setFormData({...formData, promotionalPrice: Number(e.target.value)})}
                  className="rounded-2xl border-gray-100 bg-white border-[#B89C6A]/30 h-12 focus-visible:ring-[#B89C6A]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logística */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Truck size={16} /> Estoque e Logística
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Estoque</Label>
                  <Input 
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Peso (kg)</Label>
                  <Input 
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                    className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <Label className="text-xs font-bold text-gray-500 uppercase">Dimensões (C x L x A) cm</Label>
                   <div className="flex gap-2">
                     <Input placeholder="C" type="number" value={formData.length} onChange={(e) => setFormData({...formData, length: Number(e.target.value)})} className="rounded-xl bg-gray-50 h-12" />
                     <Input placeholder="L" type="number" value={formData.width} onChange={(e) => setFormData({...formData, width: Number(e.target.value)})} className="rounded-xl bg-gray-50 h-12" />
                     <Input placeholder="A" type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: Number(e.target.value)})} className="rounded-xl bg-gray-50 h-12" />
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Imagens e Organização */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Status e Nicho */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-bold text-gray-900 uppercase">Status do Produto</span>
                <Switch 
                  checked={formData.active} 
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})} 
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Nicho (Categoria Mãe)</Label>
                  <select 
                    value={formData.categoryMother}
                    onChange={(e) => setFormData({...formData, categoryMother: e.target.value, subcategory: ''})}
                    className="w-full rounded-2xl border-gray-100 bg-gray-50 h-12 px-4 text-sm focus:ring-[#B89C6A] outline-none"
                  >
                    <option value="">Selecione o Nicho</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-500 uppercase">Subcategoria</Label>
                  <select 
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    disabled={!formData.categoryMother}
                    className="w-full rounded-2xl border-gray-100 bg-gray-50 h-12 px-4 text-sm focus:ring-[#B89C6A] outline-none disabled:opacity-50"
                  >
                    <option value="">Selecione a Subcategoria</option>
                    {selectedNiche?.subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mídia */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <ImageIcon size={16} /> Mídia Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon size={40} className="text-gray-200 mb-2" />
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Sem imagem</span>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">URL da Imagem</Label>
                <Input 
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://suaimagem.com/foto.jpg"
                  className="rounded-xl bg-gray-50 h-10 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Variações Disponíveis */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Layers size={16} /> Atributos / Variações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <p className="text-[10px] text-gray-400 mb-4 italic">Selecione quais variações este produto terá na loja.</p>
               <div className="space-y-2">
                 {availableVariations.map(v => (
                   <label key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-[#B89C6A] transition-colors">
                     <input type="checkbox" className="rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" />
                     <span className="text-xs font-bold text-gray-700">{v.name}</span>
                     <span className="text-[9px] text-gray-400 ml-auto">({v.options.length} opções)</span>
                   </label>
                 ))}
                 {availableVariations.length === 0 && (
                   <div className="text-center py-4">
                     <Link to="/adm/variacoes/novo" className="text-[10px] font-bold text-[#B89C6A] hover:underline">+ CRIAR PRIMEIRA VARIAÇÃO</Link>
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;