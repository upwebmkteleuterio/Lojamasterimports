"use client";

import React, { useState, useEffect } from 'react';
import { runDeepScan, DeepScanResult } from '@/utils/integrityDiagnostic';
import { AlertTriangle, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IntegrityBannerProps {
  entityId: string;
  tableName: string;
  uiCount: number;
}

export const IntegrityBanner = ({ entityId, tableName, uiCount }: IntegrityBannerProps) => {
  const [results, setResults] = useState<DeepScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  const startScan = async () => {
    if (!entityId) return;
    setLoading(true);
    const data = await runDeepScan(tableName, entityId);
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (entityId) startScan();
  }, [entityId]);

  const dbExists = results.some(r => r.success && r.count > 0);
  const bridgeBroken = dbExists && uiCount === 0;

  return (
    <div className={cn(
      "mb-8 p-6 rounded-[32px] border-2 transition-all duration-500",
      bridgeBroken ? "border-red-500 bg-red-50 shadow-xl shadow-red-200" : "border-[#B89C6A]/20 bg-white"
    )}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              bridgeBroken ? "bg-red-500 text-white" : "bg-black text-[#B89C6A]"
            )}>
              {bridgeBroken ? <AlertTriangle size={24} /> : <Database size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Integrity Probe: {tableName}</h3>
              <p className="text-[10px] text-gray-400 font-mono">ID: {entityId?.split('-')[0]}...</p>
            </div>
          </div>

          <Button 
            onClick={startScan} 
            disabled={loading}
            className="rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 gap-2 h-10 px-4 text-[10px] font-bold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> RE-SCAN
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {results.map((res, i) => (
            <div key={i} className={cn(
              "p-4 rounded-2xl border text-[10px]",
              res.success && res.count > 0 ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase text-gray-400">{res.strategy}</span>
                {res.success && res.count > 0 ? <CheckCircle2 size={14} className="text-green-500" /> : <Database size={14} className="text-gray-200" />}
              </div>
              <p className="text-lg font-bold">{res.count} regs</p>
            </div>
          ))}
        </div>

        {bridgeBroken && (
          <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center gap-4 animate-pulse">
            <AlertTriangle size={20} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Ponte Quebrada: Dados existem no banco mas não carregam na UI.</p>
          </div>
        )}
      </div>
    </div>
  );
};