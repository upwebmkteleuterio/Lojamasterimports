"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    try {
      // O Supabase cuidará de apagar as variantes via ON DELETE CASCADE (se configurado)
      // Caso contrário, apagamos as variantes manualmente primeiro
      const { data: prods } = await supabase.from('products').select('id').eq('category_mother_id', nicheId);
      
      if (prods && prods.length > 0) {
        const ids = prods.map(p => p.id);
        await supabase.from('product_variants').delete().in('product_id', ids);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('category_mother_id', nicheId);

      if (error) throw error;

      toast.success(`Produtos do nicho ${nicheName} removidos com sucesso!`);
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao remover produtos: " + err.message);
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
          <p className="text-xs text-red-700/70">Apague todos os itens deste nicho para recomeçar a importação.</p>
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