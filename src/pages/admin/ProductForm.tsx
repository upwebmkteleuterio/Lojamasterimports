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
      diamondDebug('info', 'Iniciando formulário para NOVO produto. Limpando campos.');
      setFormData(initialFormData);
      setVariants([]);
    } else {
      diamondDebug('info', `ID detectado (${id}). Iniciando carregamento do produto.`);
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
    try {
      diamondDebug('info', `Executando SELECT no Supabase para o produto ID: ${id}`);
      const { data: prod, error } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (error) throw error;
      
      if (prod) {
        diamondDebug('success', 'Produto recuperado do banco de dados com sucesso.', prod);
        setFormData(prod);
        
        // EXECUTA DIAGNÓSTICO DE INTEGRIDADE (Banco vs UI State Recém carregado)
        checkIntegrity('products', id!, prod);
      }
      
      diamondDebug('info', `Buscando variantes para o produto ID: ${id}`);
      const { data: dbVariants } = await supabase.from('product_variants').select('*').eq('product_id', id);
      if (dbVariants) {
        diamondDebug('success', `Carregadas ${dbVariants.length} variantes.`, dbVariants);
        setVariants(dbVariants);
      }
    } catch (error: any) {
      diamondDebug('error', 'Falha crítica ao carregar produto existente', error);
      toast.error("Erro ao carregar produto.");
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
    
    // RASTREIO DE FLUXO ANTES DO ENVIO
    traceSaveFlow('products', { ...formData, variants });

    const payload = {
      ...formData,
      sku: formData.sku?.trim() === "" ? null : formData.sku,
      barcode: formData.barcode?.trim() === "" ? null : formData.barcode,
      id: id || undefined
    };

    try {
      const { data: savedProd, error: prodError } = await supabase
        .from('products')
        .upsert(payload)
        .select()
        .single();

      if (prodError) throw prodError;

      if (savedProd) {
        diamondDebug('success', 'Produto principal salvo. Sincronizando variantes...', savedProd);
        
        // Remove as antigas antes de reinserir (Sincronização total)
        await supabase.from('product_variants').delete().eq('product_id', savedProd.id);
        
        if (variants.length > 0) {
          // CORREÇÃO DO ERRO DE NOT-NULL CONSTRAINT:
          // Removemos qualquer chave 'id' existente para que o Supabase/PostgreSQL 
          // gere um novo UUID automaticamente usando o default 'gen_random_uuid()'
          const variantsToSave = variants.map(v => {
            const { id: _ignoredId, ...variantWithoutId } = v;
            return { 
              ...variantWithoutId, 
              product_id: savedProd.id, 
              sku: v.sku?.trim() === "" ? null : v.sku,
              barcode: v.barcode?.trim() === "" ? null : v.barcode
            };
          });
          
          diamondDebug('info', `Inserindo ${variantsToSave.length} variantes sem campo 'id' para evitar violação de constraint...`, variantsToSave);
          const { error: varError } = await supabase.from('product_variants').insert(variantsToSave);
          if (varError) {
            diamondDebug('error', 'Erro ao inserir variantes', varError);
            throw varError;
          }
        }
      }

      diamondDebug('success', 'Fluxo de salvamento finalizado com êxito.');
      toast.success("Produto salvo com sucesso!");
      
      localStorage.removeItem(`form_data_${persistenceKey}`);
      navigate('/adm/produtos');
    } catch (error: any) {
      diamondDebug('error', 'Falha no salvamento do produto', error);
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
           <Button onClick={handleSave} disabled={saving} className="bg-black hover:bg-gray-800 rounded-full px-12 h-11 font-bold uppercase text-[10px] tracking-widest text-white">
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