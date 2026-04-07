"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle2, Database, Layout, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface IntegrityBannerProps {
  productId: string;
  uiVariants: any[];
}

export const IntegrityBanner = ({ productId, uiVariants }: IntegrityBannerProps) => {
  const [dbData, setDbData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Teste de Conexão e Busca Bruta (Verdade do Banco)
      const { data, error: dbError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId);

      if (dbError) throw dbError;
      setDbData(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, [productId]);

  const mismatch = (dbData?.length || 0) > 0 && uiVariants.length === 0;

  const copyReport = () => {
    const report = {
      productId,
      timestamp: new Date().toISOString(),
      database: {
        accessible: !error,
        error: error || 'none',
        count: dbData?.length || 0,
        ids: dbData?.map(v => v.id) || []
      },
      uiState: {
        count: uiVariants.length,
        items: uiVariants.map(v => ({ id: v.id, name: v.option_name }))
      },
      diagnosis: mismatch ? "MISMATCH DETECTED: Banco possui dados mas a UI está zerada." : "Íntegro ou ambos vazios."
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success("Relatório de diagnóstico copiado!");
  };

  return (
    <div className={`mb-8 p-4 rounded-3xl border-2 ${mismatch ? 'border-red-500 bg-red-50' : 'border-[#B89C6A]/20 bg-white'} transition-all`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mismatch ? 'bg-red-500 text-white' : 'bg-[#B89C6A] text-white'}`}>
            {mismatch ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Diagnóstico de Integridade Bruta</h3>
            <p className="text-[10px] text-gray-500 uppercase font-mono">{productId}</p>
          </div>
        </div>

        <div className="flex gap-6 items-center px-6 border-x border-gray-100">
          <div className="text-center">
            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Verdade do Banco</span>
            <span className="flex items-center gap-1 text-xs font-bold text-gray-900">
              <Database size={12} className="text-[#B89C6A]" /> {loading ? '...' : dbData?.length || 0} variações
            </span>
          </div>
          <div className="text-center">
            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Verdade da UI</span>
            <span className={`flex items-center gap-1 text-xs font-bold ${mismatch ? 'text-red-500' : 'text-gray-900'}`}>
              <Layout size={12} className={mismatch ? 'text-red-500' : 'text-[#B89C6A]'} /> {uiVariants.length} carregadas
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runDiagnostic} className="rounded-full h-10 px-4 gap-2 text-[10px] font-bold uppercase">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
          </Button>
          <Button onClick={copyReport} className="bg-gray-900 hover:bg-black text-white rounded-full h-10 px-6 gap-2 text-[10px] font-bold uppercase tracking-widest">
            <Copy size={14} /> COPIAR RELATÓRIO
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-xl text-[10px] font-mono">
          ERRO DE CONEXÃO DIRETA: {error}
        </div>
      )}

      {mismatch && (
        <div className="mt-4 p-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase text-center animate-pulse">
          ⚠️ BLOQUEIO DETECTADO: Os dados existem no banco mas o código do app está impedindo a exibição.
        </div>
      )}
    </div>
  );
};