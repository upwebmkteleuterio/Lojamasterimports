"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductVariation, ProductVariant } from '@/types/store';
import { toast } from 'sonner';
import { usePersistence } from '@/hooks/usePersistence';

// Importação das seções
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
  gallery: [],
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
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const persistenceKey = id ? `edit_product_${id}` : 'new_product_draft';
  const { data: formData, updateField, setData: setFormData } = usePersistence<any>(persistenceKey, initialFormData);

  useEffect(() => {
    fetchSupportData();
    if (id) fetchProduct();
  }, [id]);

  const fetchSupportData = async () => {
    // 1. Buscar Categorias com isolamento de erro
    try {
      const { data: cats, error: catsError } = await supabase
        .from('category_mothers')
        .select('*, subcategories(*)');
      
      if (catsError) {
        const { data: simpleCats } = await supabase.from('category_mothers').select('*');
        if (simpleCats) setCategories(simpleCats);
      } else if (cats) {
        setCategories(cats);
      }
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }

    // 2. Buscar Variações Globais com isolamento de erro
    try {
      const { data: vars, error: varsError } = await supabase
        .from('variations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (varsError) throw varsError;
      if (vars) setAvailableVariations(vars);
    } catch (err) {
      console.error("Erro ao carregar variações:", err);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data: prod, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (prod) {
        setFormData((prev: any) => ({ ...prod, ...prev }));
      }
      
      const { data: dbVariants } = await supabase.from('product_variants').select('*').eq('product_id', id);
      if (dbVariants) setVariants(dbVariants);
    } catch (error: any) {
      toast.error("Erro ao buscar produto: " + error.message);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_mother_id) {
      toast.error("Preencha os campos obrigatórios (*)");
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
        await supabase.from('product_variants').delete().eq('product_id', savedProd.id);
        
        if (variants.length > 0) {
          const variantsToSave = variants.map(v => ({
            ...v,
            product_id: savedProd.id,
            id: undefined 
          }));
          const { error: varError } = await supabase.from('product_variants').insert(variantsToSave);
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
           <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-black rounded-full px-12 h-11 font-bold uppercase text-[10px] tracking-widest text-white">
            {saving ? 'Gravando...' : 'Salvar Produto'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <GeneralInfoSection name={formData.name} description={formData.description} isActive={formData.is_active} onChange={updateField} />
          <PricingSection costPrice={formData.cost_price} price={formData.price} promoPrice={formData.promo_price} onChange={updateField} />
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-8">
            <InventorySection sku={formData.sku} barcode={formData.barcode} onChange={updateField} />
          </Card>
          <ShippingSection weight={formData.weight} width={formData.width} height={formData.height} length={formData.length} onChange={updateField} />
          <VariationsSection availableVariations={availableVariations} variants={variants} onUpdateVariants={setVariants} mainProductData={formData} />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <CategorizationSection nicheId={formData.category_mother_id} subcategoryId={formData.subcategory_id} stock={formData.stock} categories={categories} onFieldChange={updateField} />
          <MediaSection mainImage={formData.main_image} gallery={formData.gallery || []} onMainImageChange={(url) => updateField('main_image', url)} onGalleryChange={(newGallery) => updateField('gallery', newGallery)} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;