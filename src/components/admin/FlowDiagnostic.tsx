"use client";

import React, { useState, useEffect } from 'react';
import { IntegrityReport } from '@/utils/integrityDiagnostic';
import { subscribeToLogs } from '@/utils/debug';
import { AlertCircle, CheckCircle2, Database, Layout, ArrowRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FlowDiagnostic = () => {
  const [reports, setReports] = useState<IntegrityReport[]>([]);
  const [lastTrace, setLastTrace] = useState<any>(null);

  useEffect(() => {
    // Monitora logs específicos de integridade e flow
    return subscribeToLogs((allLogs) => {
      const integrityLogs = allLogs
        .filter(l => l.message.includes('[INTEGRITY]'))
        .map(l => l.data as IntegrityReport)
        .filter(Boolean);
      
      const traceLogs = allLogs.find(l => l.message.includes('[FLOW TRACE]'));
      
      setReports(integrityLogs.slice(0, 5));
      if (traceLogs) setLastTrace(traceLogs);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Seção de Mismatch Report */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-[#B89C6A] uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} /> Mismatch Report (Banco vs UI)
        </h4>

        {reports.length === 0 && (
          <div className="p-6 border border-dashed border-gray-800 rounded-2xl text-center">
            <p className="text-[10px] text-gray-500 uppercase">Nenhuma validação de integridade pendente.</p>
          </div>
        )}

        {reports.map((report, idx) => (
          <div key={idx} className={cn(
            "p-4 rounded-2xl border transition-all",
            report.mismatch ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"
          )}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {report.mismatch ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                <span className="text-xs font-bold uppercase">{report.entity}</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500">{report.timestamp}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-gray-500 uppercase flex items-center gap-1"><Database size={8}/> Raw DB</span>
                <div className="bg-black/40 p-2 rounded-lg text-[10px] font-mono truncate">
                  {report.dbRaw ? "Encontrado" : "Nulo/Não Encontrado"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-gray-500 uppercase flex items-center gap-1"><Layout size={8}/> UI State</span>
                <div className="bg-black/40 p-2 rounded-lg text-[10px] font-mono truncate">
                  {report.uiState ? "Carregado" : "Vazio"}
                </div>
              </div>
            </div>

            {report.mismatch && (
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Divergências Detectadas:</p>
                <div className="flex flex-wrap gap-1">
                  {report.fieldsWithDiff.map(f => (
                    <span key={f} className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rastro do Último Salvamento */}
      {lastTrace && (
        <div className="bg-[#B89C6A]/10 border border-[#B89C6A]/20 rounded-2xl p-4">
          <h4 className="text-[10px] font-bold text-[#B89C6A] uppercase tracking-widest mb-3">Último Trace de Salvamento</h4>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 mb-2">
            <span className="font-bold text-white">Entidade:</span> {lastTrace.data?.entity || 'N/A'}
          </div>
          <div className="bg-black/60 p-3 rounded-xl border border-gray-800 text-[9px] font-mono text-blue-300 max-h-32 overflow-y-auto">
            <pre>{JSON.stringify(lastTrace.data?.keys, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};