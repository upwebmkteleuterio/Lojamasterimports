"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductVariation } from '@/types/store';
import { toast } from 'sonner';
import { usePersistence } from '@/hooks/usePersistence';

// Importação das seções refatoradas
import { GeneralInfoSection } from '@/components/admin/product-form/GeneralInfoSection';
import { PricingSection } from '@/components/admin/product-form/PricingSection';
import { InventorySection } from '@/components/admin/product-form/InventorySection';
import { ShippingSection } from '@/components/admin/product-form/ShippingSection';
import { VariationsSection } from '@/components/admin/product-form/VariationsSection';
import { CategorizationSection } from '@/components/admin/product-form/CategorizationSection';
import { MediaSection } from '@/components/admin/product-form/MediaSection';

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

  const persistenceKey = id ? `edit_product_${id}` : 'new_product_draft';
  const { data: formData, updateField, setData: setFormData } = usePersistence<any>(persistenceKey, initialFormData);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);

  useEffect(() => {
    fetchSupportData();
    if (id) fetchProduct();
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
      setFormData((prev: any) => ({ ...prod, ...prev }));
    }
    const { data: links } = await supabase.from('product_variations_link').select('variation_id').eq('product_id', id);
    if (links) setSelectedVariations(links.map(l => l.variation_id));
  };

  const handleToggleVariation = (variationId: string) => {
    setSelectedVariations(prev => 
      prev.includes(variationId) ? prev.filter(id => id !== variationId) : [...prev, variationId]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_mother_id) {
      toast.error("Preencha os campos obrigatórios");
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
      localStorage.removeItem(`form_data_${persistenceKey}`);
      navigate('/adm/produtos');
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

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
          
          <GeneralInfoSection 
            name={formData.name}
            description={formData.description}
            isActive={formData.is_active}
            onChange={updateField}
          />

          <PricingSection 
            costPrice={formData.cost_price}
            price={formData.price}
            promoPrice={formData.promo_price}
            onChange={updateField}
          />

          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-8">
            <InventorySection 
              sku={formData.sku}
              barcode={formData.barcode}
              onChange={updateField}
            />
          </Card>

          <ShippingSection 
            weight={formData.weight}
            width={formData.width}
            height={formData.height}
            length={formData.length}
            onChange={updateField}
          />

          <VariationsSection 
            availableVariations={availableVariations}
            selectedVariations={selectedVariations}
            onToggle={handleToggleVariation}
          />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <CategorizationSection 
            nicheId={formData.category_mother_id}
            subcategoryId={formData.subcategory_id}
            stock={formData.stock}
            categories={categories}
            onFieldChange={updateField}
          />

          <MediaSection 
            image={formData.main_image}
            onImageChange={(url) => updateField('main_image', url)}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;