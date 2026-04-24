"use client";

import React, { useState, useEffect } from 'react';
import { IntegrityReport } from '@/utils/integrityDiagnostic';
import { subscribeToLogs } from '@/utils/debug';
import { AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FlowDiagnostic = () => {
  const [reports, setReports] = useState<IntegrityReport[]>([]);

  useEffect(() => {
    return subscribeToLogs((allLogs) => {
      const integrityLogs = allLogs
        .filter(l => l.message.includes('[INTEGRITY]'))
        .map(l => l.data as IntegrityReport)
        .filter(Boolean);
      
      setReports(integrityLogs.slice(0, 5));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-[#B89C6A] uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={14} /> Mismatch Report (Banco vs UI)
        </h4>

        {reports.length === 0 && (
          <div className="p-10 border border-dashed border-gray-800 rounded-2xl text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Nenhuma divergência detectada.</p>
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

            {report.mismatch && (
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Campos Divergentes:</p>
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
    </div>
  );
};