"use client";

import React, { useState, useEffect } from 'react';
import { runDeepScan, DeepScanResult } from '@/utils/integrityDiagnostic';
import { AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldAlert, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IntegrityBannerProps {
  productId: string;
  uiVariants: any[];
}

export const IntegrityBanner = ({ productId, uiVariants }: IntegrityBannerProps) => {
  const [results, setResults] = useState<DeepScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    setLoading(true);
    // CORREÇÃO: Passando explicitamente a tabela 'product_variants'
    const data = await runDeepScan('product_variants', productId);
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) {
      startScan();
    }
  }, [productId]);

  const anySuccess = results.some(r => r.success);
  // Se o banco retornou dados mas a UI está zerada, temos um problema real de ponte.
  const mismatch = anySuccess && uiVariants.length === 0;

  return (
    <div className={cn(
      "mb-8 p-8 rounded-[40px] border-2 transition-all duration-500",
      mismatch ? "border-red-500 bg-red-50" : "border-[#B89C6A]/20 bg-white"
    )}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
              mismatch ? "bg-red-500 text-white" : "bg-black text-[#B89C6A]"
            )}>
              {mismatch ? <AlertTriangle size={28} /> : <Zap size={28} />}
            </div>
            <div>
              <h3 className="font-bold text-lg uppercase tracking-widest">Painel de Varredura Profunda</h3>
              <p className="text-[10px] text-gray-400 font-mono">Monitorando: product_variants | Vinculadas ao Produto: {productId.split('-')[0]}...</p>
            </div>
          </div>

          <Button 
            onClick={startScan} 
            disabled={loading}
            className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 gap-2 h-12 px-6"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> REFRESH SCAN
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((res, i) => (
            <div key={i} className={cn(
              "p-5 rounded-3xl border transition-all",
              res.success && res.count > 0 ? "bg-green-50 border-green-100" : "bg-gray-50/50 border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{res.strategy}</span>
                {res.success && res.count > 0 ? <CheckCircle2 size={16} className="text-green-500" /> : <Database size={16} className="text-gray-200" />}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{res.count}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Variantes no Banco</p>
                </div>
                {!res.success && res.error && (
                  <span className="text-[8px] bg-red-100 text-red-500 px-2 py-1 rounded font-mono">ERROR</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {mismatch && (
          <div className="bg-red-500 text-white p-6 rounded-[32px] flex items-center gap-6 animate-pulse">
            <ShieldAlert size={32} />
            <div>
              <p className="font-bold uppercase tracking-[0.1em]">Ponte de Dados Obstruída</p>
              <p className="text-xs opacity-90 leading-relaxed">
                O banco de dados confirmou a existência de variações, mas a interface não as carregou. 
                Isso geralmente indica um erro de mapeamento no serviço de busca.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};