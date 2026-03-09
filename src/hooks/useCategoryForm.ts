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

      // 3. Limpeza de Removidas
      if (id) {
        const currentFullIds = subsToUpsert.map(s => s.id);
        diamondDebug('info', 'Sincronizando subcategorias...', { mantendo: currentFullIds });
        
        // Buscamos o que existe no banco agora para comparar
        const { data: existingInDb } = await supabase
          .from('subcategories')
          .select('id')
          .eq('mother_id', formData.id);
        
        const idsToRemove = (existingInDb || [])
          .map(s => s.id)
          .filter(dbId => !currentFullIds.includes(dbId));

        if (idsToRemove.length > 0) {
          diamondDebug('info', `Tentando excluir ${idsToRemove.length} subcategorias:`, idsToRemove);
          
          const { error: deleteError } = await supabase
            .from('subcategories')
            .delete()
            .in('id', idsToRemove);

          if (deleteError) {
            diamondDebug('error', 'FALHA NA EXCLUSÃO DE SUBCATEGORIA', {
              code: deleteError.code,
              message: deleteError.message,
              details: deleteError.details,
              hint: deleteError.hint
            });
            
            if (deleteError.code === '23503') {
              toast.error("Não foi possível excluir uma subcategoria pois existem produtos vinculados a ela.");
              throw new Error("Violação de integridade: produtos vinculados.");
            }
            throw deleteError;
          }
          diamondDebug('success', 'Subcategorias removidas com sucesso.');
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
      // O toast de erro específico já foi dado acima se for 23503
      if (!error.message.includes("Violação")) {
        toast.error("Erro ao salvar alterações.");
      }
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