import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';

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
        diamondDebug('success', 'Nicho carregado com sucesso', cat);
      }

      const { data: subs, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('mother_id', id);
      
      if (subError) throw subError;
      if (subs) {
        diamondDebug('info', `Carregadas ${subs.length} subcategorias`, subs);
        const prefix = `${id}-`;
        setSubcategories(subs.map(s => ({ 
          id: s.id.startsWith(prefix) ? s.id.slice(prefix.length) : s.id, 
          name: s.name,
          image_url: s.image_url || ''
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
    diamondDebug('info', 'Iniciando processo de salvamento (UPSERT)...');
    diamondDebug('info', 'Dados do nicho principal:', formData);
    diamondDebug('info', 'Subcategorias em memória:', subcategories);

    try {
      // 1. Salvar/Atualizar Categoria Mãe
      const { error: catError } = await supabase
        .from('category_mothers')
        .upsert({
          id: formData.id,
          name: formData.name,
          is_active: formData.is_active,
          landing_banner: formData.landing_banner,
          home_hero_banner: formData.home_hero_banner,
          updated_at: new Date().toISOString()
        });
      
      if (catError) {
        diamondDebug('error', 'Erro ao salvar categoria mãe', catError);
        throw catError;
      }

      // 2. Sincronizar Subcategorias
      const currentFullIds = subcategories.map(s => s.id.startsWith(`${formData.id}-`) ? s.id : `${formData.id}-${s.id}`);
      
      diamondDebug('info', 'IDs que devem permanecer no banco:', currentFullIds);

      // Limpeza de órfãs
      if (id) {
        const { error: delError } = await supabase
          .from('subcategories')
          .delete()
          .eq('mother_id', formData.id)
          .not('id', 'in', `(${currentFullIds.length > 0 ? currentFullIds.join(',') : 'none'})`);
        
        if (delError) {
          diamondDebug('error', 'Erro ao deletar subcategorias antigas', delError);
        } else {
          diamondDebug('success', 'Subcategorias obsoletas removidas com sucesso');
        }
      }
      
      // 3. Inserir/Atualizar as subcategorias atuais
      if (subcategories.length > 0) {
        const subsToUpsert = subcategories.map(s => ({
          id: s.id.startsWith(`${formData.id}-`) ? s.id : `${formData.id}-${s.id}`,
          name: s.name,
          image_url: s.image_url,
          mother_id: formData.id
        }));

        diamondDebug('info', 'Enviando payload de subcategorias:', subsToUpsert);

        const { error: subError } = await supabase.from('subcategories').upsert(subsToUpsert);
        if (subError) {
          diamondDebug('error', 'Erro no UPSERT das subcategorias', subError);
          throw subError;
        }
        diamondDebug('success', 'Subcategorias sincronizadas com sucesso');
      }

      diamondDebug('success', 'PROCESSO FINALIZADO: Tudo salvo no Supabase!');
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