"use client";

import React, { useState, useEffect } from 'react';
import { IntegrityReport, runDeepScan } from '@/utils/integrityDiagnostic';
import { subscribeToLogs } from '@/utils/debug';
import { AlertCircle, CheckCircle2, Activity, Search, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const FlowDiagnostic = () => {
  const [reports, setReports] = useState<IntegrityReport[]>([]);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return subscribeToLogs((allLogs) => {
      const integrityLogs = allLogs
        .filter(l => l.message.includes('[INTEGRITY]'))
        .map(l => l.data as IntegrityReport)
        .filter(Boolean);
      
      setReports(integrityLogs.slice(0, 5));
    });
  }, []);

  const handleDeepScan = async () => {
    if (reports.length === 0) {
      toast.error("Nenhum ID de entidade encontrado para scan.");
      return;
    }
    
    setIsScanning(true);
    const lastReport = reports[0];
    const results = await runDeepScan(lastReport.entity, lastReport.id);
    setScanResults(results);
    setIsScanning(false);
    toast.success("Varredura profunda concluída!");
  };

  return (
    <div className="space-y-8">
      {/* Deep Scan Action */}
      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#B89C6A]" size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#B89C6A]">Data-Bridge Integrity Probe</h4>
          </div>
          <Button 
            size="sm" 
            onClick={handleDeepScan}
            disabled={isScanning || reports.length === 0}
            className="h-8 rounded-xl bg-[#B89C6A] hover:bg-white hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all"
          >
            {isScanning ? "Escaneando..." : "Executar Deep Scan"}
          </Button>
        </div>

        {scanResults.length > 0 && (
          <div className="space-y-2 mt-4">
            {scanResults.map((res, i) => (
              <div key={i} className={cn(
                "p-3 rounded-xl border flex items-center justify-between gap-4",
                res.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
              )}>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{res.strategy}</span>
                  <span className={cn("text-[10px] font-medium", res.success ? "text-emerald-400" : "text-red-400")}>
                    {res.diagnosis}
                  </span>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                    res.success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {res.success ? "Encontrado" : "Falhou"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mismatch Reports */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} /> Mismatch History
        </h4>

        {reports.length === 0 && (
          <div className="p-10 border border-dashed border-gray-800 rounded-3xl text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Nenhuma divergência detectada.</p>
          </div>
        )}

        {reports.map((report, idx) => (
          <div key={idx} className={cn(
            "p-5 rounded-3xl border transition-all",
            report.mismatch ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                {report.mismatch ? <ShieldAlert size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase text-white">{report.entity}</span>
                  <span className="text-[9px] font-mono text-gray-500 truncate max-w-[200px]">{report.id}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-gray-500">{report.timestamp}</span>
            </div>

            <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
               <p className={cn(
                 "text-[10px] font-bold uppercase",
                 report.mismatch ? "text-red-400" : "text-emerald-400"
               )}>
                 Diagnóstico: {report.diagnosis}
               </p>
            </div>

            {report.mismatch && report.fieldsWithDiff.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[9px] font-bold text-red-400 uppercase">Campos Divergentes:</p>
                <div className="flex flex-wrap gap-2">
                  {report.fieldsWithDiff.map(f => (
                    <span key={f} className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-lg uppercase font-black">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
