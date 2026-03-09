"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';

interface DeleteNicheProductsProps {
  nicheId: string;
  nicheName: string;
  onSuccess: () => void;
}

export const DeleteNicheProducts = ({ nicheId, nicheName, onSuccess }: DeleteNicheProductsProps) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAll = async () => {
    const confirm = window.confirm(`ATENÇÃO: Isso apagará TODOS os produtos e variações do nicho ${nicheName}. Esta ação não pode ser desfeita. Deseja continuar?`);
    if (!confirm) return;

    setLoading(true);
    diamondDebug('info', `Iniciando limpeza total do nicho: ${nicheName} (${nicheId})`);

    try {
      // 1. Buscar IDs dos produtos para limpar as variantes primeiro (evitar erro de FK)
      const { data: prods, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('category_mother_id', nicheId);
      
      if (fetchError) {
        diamondDebug('error', 'Falha ao buscar IDs dos produtos para exclusão', fetchError);
        throw fetchError;
      }

      if (prods && prods.length > 0) {
        const ids = prods.map(p => p.id);
        diamondDebug('info', `Localizados ${ids.length} produtos. Removendo variações vinculadas...`);
        
        const { error: varError } = await supabase
          .from('product_variants')
          .delete()
          .in('product_id', ids);
          
        if (varError) {
          diamondDebug('error', 'Falha ao remover variações', varError);
          throw varError;
        }
        diamondDebug('success', 'Variações removidas com sucesso.');
      } else {
        diamondDebug('info', 'Nenhum produto encontrado para este nicho.');
      }

      // 2. Apagar os produtos
      diamondDebug('info', `Executando DELETE na tabela 'products' para o nicho ${nicheId}...`);
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('category_mother_id', nicheId);

      if (deleteError) {
        diamondDebug('error', 'Erro do Supabase ao deletar produtos', deleteError);
        throw deleteError;
      }

      diamondDebug('success', `Limpeza do nicho ${nicheName} concluída com êxito.`);
      toast.success(`Produtos do nicho ${nicheName} removidos!`);
      
      // Forçar atualização da lista
      onSuccess();
    } catch (err: any) {
      diamondDebug('error', 'Falha crítica no processo de limpeza', err);
      toast.error("Erro ao remover: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-red-900 text-sm">Zona de Perigo: {nicheName}</h4>
          <p className="text-xs text-red-700/70">Apague todos os itens para recomeçar.</p>
        </div>
      </div>
      <Button 
        variant="destructive" 
        onClick={handleDeleteAll} 
        disabled={loading}
        className="rounded-full px-8 font-bold uppercase text-[10px] tracking-widest h-12"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Trash2 size={16} className="mr-2" /> LIMPAR NICHO</>}
      </Button>
    </div>
  );
};