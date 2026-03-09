import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';
import { Subcategory } from '@/types/store';

export const useCategoryForm = (id: string | undefined) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    is_active: true,
    landing_banner: '',
    home_hero_banner: ''
  });

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (id) {
      fetchCategoryData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCategoryData = async () => {
    setLoading(true);
    diamondDebug('info', `Sincronizando dados do banco para o nicho: ${id}`);
    try {
      const { data: cat, error: catError } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (catError) throw catError;
      if (cat) {
        setFormData(cat);
      }

      const { data: subs, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', id);
      
      if (subError) throw subError;
      if (subs) {
        const prefix = `${id}-`;
        setSubcategories(subs.map(s => ({ 
          id: s.id.startsWith(prefix) ? s.id.slice(prefix.length) : s.id, 
          name: s.name,
          image_url: s.image_url || '',
          is_featured: s.is_featured === true 
        })));
      }
    } catch (error: any) {
      diamondDebug('error', 'Falha ao buscar dados no banco', error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (onSuccess: () => void) => {
    if (!formData.name || !formData.id) {
      toast.error("Nome e URL amigável são obrigatórios");
      return;
    }

    setSaving(true);
    diamondDebug('info', 'Iniciando processo de salvamento de Categoria...');

    try {
      // 1. Salva Categoria Mãe
      const { error: catError } = await supabase
        .from('category_mothers')
        .upsert({
          id: formData.id,
          name: formData.name,
          is_active: formData.is_active,
          landing_banner: formData.landing_banner,
          home_hero_banner: formData.home_hero_banner
        });
      
      if (catError) throw catError;

      // 2. Prepara Subcategorias
      const subsToUpsert = subcategories.map(s => ({
        id: s.id.includes('-') ? s.id : `${formData.id}-${s.id}`,
        name: s.name,
        image_url: s.image_url,
        mother_id: formData.id,
        is_featured: !!s.is_featured
      }));

      // 3. Limpeza de Removidas com Verificação
      if (id) {
        const currentFullIds = subsToUpsert.map(s => s.id);
        const { data: existingInDb } = await supabase
          .from('subcategories')
          .select('id, name')
          .eq('mother_id', formData.id);
        
        const idsToRemove = (existingInDb || [])
          .map(s => s.id)
          .filter(dbId => !currentFullIds.includes(dbId));

        if (idsToRemove.length > 0) {
          // BLOQUEIO PREVENTIVO: Verifica se há produtos usando esses IDs
          const { data: linkedProducts } = await supabase
            .from('products')
            .select('id, subcategory_id')
            .in('subcategory_id', idsToRemove);

          if (linkedProducts && linkedProducts.length > 0) {
            const problematicIds = Array.from(new Set(linkedProducts.map(p => p.subcategory_id)));
            const problematicNames = (existingInDb || [])
              .filter(s => problematicIds.includes(s.id))
              .map(s => s.name);

            diamondDebug('error', 'Tentativa de exclusão bloqueada: Produtos vinculados', { problematicNames });
            toast.error(`Não é possível excluir: "${problematicNames.join(', ')}" pois existem produtos vinculados.`);
            
            // Recarrega para restaurar o item na lista da UI
            await fetchCategoryData();
            setSaving(false);
            return; 
          }

          const { error: deleteError } = await supabase
            .from('subcategories')
            .delete()
            .in('id', idsToRemove);

          if (deleteError) {
            diamondDebug('error', 'Erro inesperado na exclusão', deleteError);
            toast.error("Erro ao remover subcategorias. Sincronizando dados...");
            await fetchCategoryData();
            throw deleteError;
          }
        }
      }
      
      // 4. Upsert das novas/editadas
      if (subsToUpsert.length > 0) {
        const { error: subError } = await supabase.from('subcategories').upsert(subsToUpsert);
        if (subError) throw subError;
      }

      diamondDebug('success', 'Nicho e subcategorias atualizados com êxito.');
      toast.success("Salvo com sucesso!");
      onSuccess();
    } catch (error: any) {
      diamondDebug('error', 'FALHA NO PROCESSO DE SALVAMENTO', error);
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    subcategories,
    setSubcategories,
    saving,
    loading,
    handleSave
  };
};