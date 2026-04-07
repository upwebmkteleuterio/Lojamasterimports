"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle2, Database, Layout, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IntegrityBannerProps {
  productId: string;
  uiVariants: any[];
}

export const IntegrityBanner = ({ productId, uiVariants }: IntegrityBannerProps) => {
  const [dbData, setDbData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<any>(null);

  const runDiagnostic = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Verificação de Auth (RLS Check)
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: profile } = session ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle() : { data: null };

      setAuthStatus({
        logged: !!session,
        role: profile?.role || 'anon'
      });

      // 2. Busca Bruta (Verdade do Banco)
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

  return (
    <div className={`mb-8 p-6 rounded-[32px] border-2 transition-all ${mismatch ? 'border-red-500 bg-red-50/50' : 'border-[#B89C6A]/20 bg-white'}`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mismatch ? 'bg-red-500 text-white' : 'bg-[#B89C6A] text-white'}`}>
              {mismatch ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Diagnóstico Profundo de Fluxo</h3>
              <p className="text-[10px] text-gray-500 uppercase font-mono">{productId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={runDiagnostic} className="rounded-full h-10 px-4 gap-2 text-[10px] font-bold uppercase">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
             <span className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Conexão Banco</span>
             <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", error ? "bg-red-500" : "bg-green-500")} />
                <span className="text-xs font-bold">{error ? 'Falha' : 'Ativa'}</span>
             </div>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
             <span className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Status RLS/Auth</span>
             <div className="flex items-center gap-2">
                <Key size={12} className="text-[#B89C6A]" />
                <span className="text-xs font-bold uppercase">{authStatus?.role || '---'}</span>
             </div>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
             <span className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Variações no Banco</span>
             <div className="flex items-center gap-2">
                <Database size={12} className="text-[#B89C6A]" />
                <span className="text-xs font-bold">{dbData?.length || 0} encontradas</span>
             </div>
          </div>
          <div className="bg-white/50 p-4 rounded-2xl border border-gray-100">
             <span className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Variações na UI</span>
             <div className="flex items-center gap-2">
                <Layout size={12} className={mismatch ? 'text-red-500' : 'text-[#B89C6A]'} />
                <span className={cn("text-xs font-bold", mismatch && "text-red-500")}>{uiVariants.length} carregadas</span>
             </div>
          </div>
        </div>

        {mismatch && (
          <div className="bg-red-500 text-white p-4 rounded-2xl flex items-center gap-4 animate-pulse">
            <ShieldAlert size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">Bloqueio de Renderização Detectado</p>
              <p className="text-[10px] opacity-90">O Supabase retornou dados, mas o código não os processou corretamente.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-mono text-[10px]">
            ERRO POSTGREST: {error}
          </div>
        )}
      </div>
    </div>
  );
};