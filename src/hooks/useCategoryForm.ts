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
    diamondDebug('info', `Iniciando carregamento de dados para o nicho: ${id}`);
    try {
      const { data: cat, error: catError } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (catError) throw catError;
      if (cat) {
        diamondDebug('success', 'Nicho carregado com sucesso', cat);
        setFormData(cat);
      }

      const { data: subs, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', id);
      
      if (subError) throw subError;
      if (subs) {
        diamondDebug('info', `Localizadas ${subs.length} subcategorias no banco`, subs);
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
      toast.error("Erro ao carregar dados: " + error.message);
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
    diamondDebug('info', 'Iniciando processo de salvamento...');

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
      diamondDebug('success', 'Categoria mãe salva/atualizada.');

      // 2. Trata Subcategorias
      const subsToUpsert = subcategories.map(s => ({
        id: s.id.startsWith(`${formData.id}-`) ? s.id : `${formData.id}-${s.id}`,
        name: s.name,
        image_url: s.image_url,
        mother_id: formData.id,
        is_featured: !!s.is_featured // Força boolean
      }));

      diamondDebug('info', 'Payload de subcategorias preparado para UPSERT', subsToUpsert);

      // Deleta as que não estão mais na lista (Lógica Corrigida)
      if (id) {
        const currentFullIds = subsToUpsert.map(s => s.id);
        diamondDebug('info', 'Limpando subcategorias removidas...', { mantendo: currentFullIds });
        
        const deleteQuery = supabase
          .from('subcategories')
          .delete()
          .eq('mother_id', formData.id);

        if (currentFullIds.length > 0) {
          await deleteQuery.not('id', 'in', currentFullIds);
        } else {
          await deleteQuery;
        }
      }
      
      if (subsToUpsert.length > 0) {
        const { error: subError } = await supabase.from('subcategories').upsert(subsToUpsert);
        if (subError) {
          diamondDebug('error', 'Erro ao dar upsert nas subcategorias', subError);
          throw subError;
        }
        diamondDebug('success', 'Subcategorias sincronizadas com sucesso.');
      }

      diamondDebug('success', 'PROCESSO FINALIZADO.');
      toast.success("Dados salvos com sucesso!");
      onSuccess();
    } catch (error: any) {
      diamondDebug('error', 'FALHA NO SALVAMENTO', error);
      toast.error("Erro ao salvar: " + error.message);
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