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
    // Validação rigorosa do ID do nicho
    const nicheId = formData.id?.trim();
    if (!formData.name?.trim() || !nicheId) {
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
          id: nicheId,
          name: formData.name.trim(),
          is_active: formData.is_active,
          landing_banner: formData.landing_banner,
          home_hero_banner: formData.home_hero_banner
        });
      
      if (catError) throw catError;

      // 2. Prepara Subcategorias garantindo que mother_id nunca seja nulo
      const subsToUpsert = subcategories.map(s => {
        const subId = s.id.includes('-') ? s.id : `${nicheId}-${s.id}`;
        return {
          id: subId,
          name: s.name.trim(),
          image_url: s.image_url || '',
          mother_id: nicheId, // Usando a constante validada
          is_featured: !!s.is_featured
        };
      });

      diamondDebug('info', 'Payload de subcategorias preparado:', subsToUpsert);

      // 3. Limpeza de Removidas com Verificação
      if (id) {
        const currentFullIds = subsToUpsert.map(s => s.id);
        const { data: existingInDb } = await supabase
          .from('subcategories')
          .select('id, name')
          .eq('mother_id', nicheId);
        
        const idsToRemove = (existingInDb || [])
          .map(s => s.id)
          .filter(dbId => !currentFullIds.includes(dbId));

        if (idsToRemove.length > 0) {
          const { data: linkedProducts } = await supabase
            .from('products')
            .select('id, subcategory_id')
            .in('subcategory_id', idsToRemove);

          if (linkedProducts && linkedProducts.length > 0) {
            const problematicIds = Array.from(new Set(linkedProducts.map(p => p.subcategory_id)));
            const problematicNames = (existingInDb || [])
              .filter(s => problematicIds.includes(s.id))
              .map(s => s.name);

            toast.error(`Não é possível excluir: "${problematicNames.join(', ')}" pois existem produtos vinculados.`);
            await fetchCategoryData();
            setSaving(false);
            return; 
          }

          const { error: deleteError } = await supabase
            .from('subcategories')
            .delete()
            .in('id', idsToRemove);

          if (deleteError) throw deleteError;
        }
      }
      
      // 4. Upsert das novas/editadas
      if (subsToUpsert.length > 0) {
        const { error: subError } = await supabase.from('subcategories').upsert(subsToUpsert);
        if (subError) {
          diamondDebug('error', 'Erro ao salvar subcategorias no banco:', subError);
          throw subError;
        }
      }

      diamondDebug('success', 'Nicho e subcategorias atualizados com êxito.');
      toast.success("Salvo com sucesso!");
      onSuccess();
    } catch (error: any) {
      diamondDebug('error', 'FALHA NO PROCESSO DE SALVAMENTO', error);
      toast.error("Erro técnico ao salvar. Verifique o Monitor de Diagnóstico.");
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