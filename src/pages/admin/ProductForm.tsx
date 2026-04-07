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
import { diamondDebug } from '@/utils/debug';
import { checkIntegrity, traceSaveFlow } from '@/utils/integrityDiagnostic';

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
    if (!id) {
      setFormData(initialFormData);
      setVariants([]);
    } else {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const { data: cats } = await supabase.from('category_mothers').select('*');
      const { data: subs } = await supabase.from('subcategories').select('*');
      
      const mappedCategories = (cats || []).map(cat => ({
        ...cat,
        subcategories: (subs || []).filter(s => s.mother_id === cat.id)
      }));

      setCategories(mappedCategories);

      const { data: vars } = await supabase
        .from('variations')
        .select('*')
        .order('created_at', { ascending: false });
      
      setAvailableVariations(vars || []);
    } catch (err: any) {
      diamondDebug('error', 'Falha ao buscar dados de suporte', err);
    }
  };

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      diamondDebug('info', `Buscando produto e variantes para ID: ${id}`);
      
      // Busca produto
      const { data: prod, error: prodError } = await supabase.from('products').select('*').eq('id', id).single();
      if (prodError) throw prodError;
      
      if (prod) {
        setFormData(prod);
        checkIntegrity('products', id, prod);
      }
      
      // Busca variantes de forma isolada e GARANTE que o estado seja atualizado
      const { data: dbVariants, error: varError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id);
      
      if (varError) throw varError;

      if (dbVariants) {
        diamondDebug('success', `Carregadas ${dbVariants.length} variantes do banco.`, dbVariants);
        // Mapeia para garantir que números sejam números (numeric do postgres às vezes vem como string)
        const mappedVariants = dbVariants.map(v => ({
          ...v,
          price: Number(v.price),
          cost_price: Number(v.cost_price || 0),
          promo_price: Number(v.promo_price || 0),
          weight: Number(v.weight || 0),
          height: Number(v.height || 0),
          width: Number(v.width || 0),
          length: Number(v.length || 0)
        }));
        setVariants(mappedVariants);
      }
    } catch (error: any) {
      diamondDebug('error', 'Erro ao carregar dados do produto', error);
      toast.error("Erro ao carregar dados do banco.");
    }
  };

  const handleGenerateSku = () => {
    const prefix = formData.name 
      ? formData.name.substring(0, 3).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : 'PROD';
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSku = `${prefix}-${random}`;
    updateField('sku', newSku);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_mother_id) {
      toast.error("Preencha os campos obrigatórios (*)");
      return;
    }

    setSaving(true);
    traceSaveFlow('products', { ...formData, variants });

    try {
      // 1. Salva o produto principal
      const productPayload = {
        ...formData,
        id: id || undefined,
        sku: formData.sku?.trim() === "" ? null : formData.sku,
        barcode: formData.barcode?.trim() === "" ? null : formData.barcode
      };

      const { data: savedProd, error: prodError } = await supabase
        .from('products')
        .upsert(productPayload)
        .select()
        .single();

      if (prodError) throw prodError;

      // 2. Sincroniza Variantes (Lógica Segura)
      if (savedProd) {
        // Primeiro, buscamos as variações que existem atualmente no banco para este produto
        const { data: currentVars } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', savedProd.id);
        
        const currentIds = (currentVars || []).map(v => v.id);
        const incomingIds = variants.map(v => v.id).filter(Boolean);

        // Identifica IDs para deletar (os que estão no banco mas não vieram da UI)
        const idsToDelete = currentIds.filter(id => !incomingIds.includes(id));
        
        if (idsToDelete.length > 0) {
          await supabase.from('product_variants').delete().in('id', idsToDelete);
        }

        // Prepara variantes para Upsert (preserva IDs existentes para não quebrar constraints)
        if (variants.length > 0) {
          const variantsToUpsert = variants.map(v => {
            // Se o ID for um UUID válido, mantém. Se for algo como 'temp-' ou nulo, remove para o banco gerar.
            const isTempId = !v.id || v.id.toString().startsWith('temp');
            
            return {
              ...(isTempId ? {} : { id: v.id }),
              product_id: savedProd.id,
              attribute_name: v.attribute_name,
              option_name: v.option_name,
              sku: v.sku?.trim() === "" ? null : v.sku,
              barcode: v.barcode?.trim() === "" ? null : v.barcode,
              price: v.price,
              cost_price: v.cost_price,
              promo_price: v.promo_price,
              stock: v.stock,
              main_image: v.main_image,
              weight: v.weight,
              height: v.height,
              width: v.width,
              length: v.length,
              is_active: v.is_active
            };
          });

          const { error: varError } = await supabase.from('product_variants').upsert(variantsToUpsert);
          if (varError) throw varError;
        }
      }

      diamondDebug('success', 'Produto e variantes sincronizados com sucesso.');
      toast.success("Produto atualizado!");
      localStorage.removeItem(`form_data_${persistenceKey}`);
      navigate('/adm/produtos');
    } catch (error: any) {
      diamondDebug('error', 'Falha no salvamento seguro', error);
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
           <Button variant="ghost" onClick={() => navigate('/adm/produtos')} className="rounded-full px-6 uppercase text-[10px] font-bold tracking-widest text-gray-400">Cancelar</Button>
           <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-gray-800 rounded-full px-12 h-11 font-bold uppercase text-[10px] tracking-widest text-white shadow-lg">
            {saving ? 'Gravando...' : 'Salvar Alterações'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <GeneralInfoSection name={formData.name} description={formData.description} isActive={formData.is_active} onChange={updateField} />
          <PricingSection costPrice={formData.cost_price} price={formData.price} promoPrice={formData.promo_price} onChange={updateField} />
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden p-8">
            <InventorySection 
              sku={formData.sku} 
              barcode={formData.barcode} 
              onChange={updateField} 
              onGenerateSku={handleGenerateSku}
            />
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