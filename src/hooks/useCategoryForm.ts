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
        const mappedSubs = subs.map(s => ({ 
          id: s.id.startsWith(prefix) ? s.id.slice(prefix.length) : s.id, 
          name: s.name,
          image_url: s.image_url || '',
          is_featured: s.is_featured === true 
        }));
        
        diamondDebug('success', `Carregadas ${mappedSubs.length} subcategorias do banco.`);
        setSubcategories(mappedSubs);
      }
    } catch (error: any) {
      diamondDebug('error', 'Falha ao buscar dados no banco', error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (onSuccess: () => void) => {
    const nicheId = formData.id?.trim();
    if (!formData.name?.trim() || !nicheId) {
      toast.error("Nome e URL amigável são obrigatórios");
      return;
    }

    setSaving(true);
    diamondDebug('info', 'Iniciando processo de salvamento...');

    try {
      // 1. Upsert do Nicho (Categoria Mãe)
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

      // 2. Sincronização de Subcategorias
      // Pegamos o que existe no banco ANTES para comparar
      const { data: dbItems } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('mother_id', nicheId);

      const existingInDb = dbItems || [];
      const currentFullIds = subcategories.map(s => s.id.includes('-') ? s.id : `${nicheId}-${s.id}`);

      // Identifica o que deve ser APAGADO (está no banco mas não na tela)
      const idsToRemove = existingInDb
        .map(db => db.id)
        .filter(dbId => !currentFullIds.includes(dbId));

      if (idsToRemove.length > 0) {
        diamondDebug('info', `Verificando dependências para ${idsToRemove.length} itens remotos...`);
        
        // Verificação preventiva de produtos
        const { data: linkedProducts } = await supabase
          .from('products')
          .select('id, subcategory_id')
          .in('subcategory_id', idsToRemove);

        if (linkedProducts && linkedProducts.length > 0) {
          const problematicIds = Array.from(new Set(linkedProducts.map(p => p.subcategory_id)));
          const problematicNames = existingInDb
            .filter(s => problematicIds.includes(s.id))
            .map(s => s.name);

          diamondDebug('error', 'Exclusão bloqueada: Produtos vinculados detectados.', { problematicNames });
          toast.error(`Ação bloqueada! As categorias "${problematicNames.join(', ')}" contêm produtos e não podem ser removidas.`);
          
          // FORÇAR RECARGA: Isso "destrava" o sistema trazendo os itens de volta pra tela
          await fetchCategoryData();
          setSaving(false);
          return;
        }

        // Se não houver produtos, apaga
        const { error: delError } = await supabase.from('subcategories').delete().in('id', idsToRemove);
        if (delError) throw delError;
      }

      // 3. Salva/Atualiza o que sobrou (incluindo as estrelinhas)
      const subsToUpsert = subcategories.map(s => ({
        id: s.id.includes('-') ? s.id : `${nicheId}-${s.id}`,
        name: s.name.trim(),
        image_url: s.image_url || '',
        mother_id: nicheId,
        is_featured: !!s.is_featured
      }));

      if (subsToUpsert.length > 0) {
        const { error: subError } = await supabase.from('subcategories').upsert(subsToUpsert);
        if (subError) throw subError;
      }

      diamondDebug('success', 'Salvamento concluído com sucesso.');
      toast.success("Alterações salvas!");
      
      // Recarrega para garantir que tudo esteja 100% sincronizado
      await fetchCategoryData();
      onSuccess();
    } catch (error: any) {
      diamondDebug('error', 'Erro crítico no salvamento', error);
      toast.error("Ocorreu um erro. Recarregando dados de segurança...");
      await fetchCategoryData(); // Tenta destravar a UI
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