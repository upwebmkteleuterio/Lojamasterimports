import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const [subcategories, setSubcategories] = useState<{id: string, name: string, image_url: string}[]>([]);

  useEffect(() => {
    if (id) {
      fetchCategoryData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const { data: cat, error: catError } = await supabase
        .from('category_mothers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (catError) throw catError;
      if (cat) setFormData(cat);

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
          image_url: s.image_url || ''
        })));
      }
    } catch (error: any) {
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
    try {
      // 1. Salvar Categoria Mãe
      const { error: catError } = await supabase
        .from('category_mothers')
        .upsert(formData);
      
      if (catError) throw catError;

      // 2. Sincronizar Subcategorias
      await supabase.from('subcategories').delete().eq('mother_id', formData.id);
      
      if (subcategories.length > 0) {
        const subsToInsert = subcategories.map(s => ({
          id: s.id.startsWith(`${formData.id}-`) ? s.id : `${formData.id}-${s.id}`,
          name: s.name,
          image_url: s.image_url,
          mother_id: formData.id
        }));

        const { error: subError } = await supabase.from('subcategories').insert(subsToInsert);
        if (subError) throw subError;
      }

      toast.success("Nicho e subcategorias atualizados com sucesso!");
      onSuccess();
    } catch (error: any) {
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