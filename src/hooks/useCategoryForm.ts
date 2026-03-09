import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';
import { Subcategory } from '@/types/store';

export const useCategoryForm = (motherId: string | undefined) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: '', name: '', is_active: true, landing_banner: '', home_hero_banner: '' });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (motherId) fetchCategoryData();
  }, [motherId]);

  const fetchCategoryData = async () => {
    setLoading(true);
    diamondDebug('info', `Buscando dados do nicho: ${motherId}`);
    try {
      const { data: cat } = await supabase.from('category_mothers').select('*').eq('id', motherId).maybeSingle();
      if (cat) setFormData(cat);

      const { data: subs } = await supabase.from('subcategories').select('*').eq('mother_id', motherId).order('name');
      
      if (subs) {
        setSubcategories(subs.map(s => ({ 
          id: s.id, 
          name: s.name,
          image_url: s.image_url || '',
          is_featured: !!s.is_featured 
        })));
        diamondDebug('success', `Carregadas ${subs.length} subcategorias do banco.`);
      }
    } catch (error) {
      diamondDebug('error', 'Falha ao carregar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (onSuccess: () => void) => {
    if (!formData.id) return;
    setSaving(true);
    diamondDebug('info', 'Iniciando salvamento... (Nenhuma tentativa de exclusão será feita)');
    
    try {
      // Atualiza o nicho principal
      await supabase.from('category_mothers').upsert(formData);

      // Prepara o payload das subcategorias que estão na tela
      const payload = subcategories.map(s => ({
        id: s.id,
        name: s.name.trim(),
        image_url: s.image_url || '',
        mother_id: formData.id,
        is_featured: !!s.is_featured
      }));

      // Apenas ATUALIZA ou ADICIONA. Nunca apaga nada do banco.
      if (payload.length > 0) {
        diamondDebug('info', `Enviando ${payload.length} itens para o Supabase (Upsert)...`);
        const { error } = await supabase.from('subcategories').upsert(payload);
        if (error) throw error;
      }

      diamondDebug('success', 'Salvamento concluído com sucesso.');
      toast.success("Alterações salvas!");
      onSuccess();
    } catch (error: any) {
      diamondDebug('error', 'Falha no salvamento', error);
      toast.error("Erro ao salvar. Verifique os logs.");
    } finally {
      setSaving(false);
    }
  };

  // Função para deletar MANUALMENTE uma categoria (apenas via clique no ícone)
  const deleteSubcategoryManual = async (id: string) => {
    try {
      // Verifica se há produtos
      const { data: products } = await supabase.from('products').select('id').eq('subcategory_id', id).limit(1);
      if (products && products.length > 0) {
        toast.error("Não é possível remover: esta categoria contém produtos.");
        return false;
      }
      
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
      
      setSubcategories(prev => prev.filter(s => s.id !== id));
      toast.success("Categoria removida do banco.");
      return true;
    } catch (err) {
      toast.error("Erro ao tentar excluir.");
      return false;
    }
  };

  return { formData, setFormData, subcategories, setSubcategories, saving, loading, handleSave, deleteSubcategoryManual };
};