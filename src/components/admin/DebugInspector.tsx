"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Terminal, Copy, X, Activity, List, Check, Zap, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToLogs, getLogs } from '@/utils/debug';
import { FlowDiagnostic } from './FlowDiagnostic';
import { cn } from '@/lib/utils';

export const DebugInspector = () => {
  const [logs, setLogs] = useState(getLogs());
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'flow'>('logs');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    return subscribeToLogs(setLogs);
  }, []);

  const copyAll = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("JSON completo copiado!");
  };

  const copySingle = (log: any, index: number) => {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Log individual copiado!");
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-black text-[#B89C6A] p-4 rounded-full shadow-2xl z-[99999] flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border-2 border-[#B89C6A] group"
      >
        <Cpu size={24} className="animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-2">Integrity Probe</span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[550px] h-[75vh] border-2 border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] z-[99999] bg-zinc-950 text-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 rounded-[32px]">
      <div className="p-5 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between border-b border-white/5">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl",
              activeTab === 'logs' ? "bg-[#B89C6A] text-black" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <List size={14} /> Console Logs
          </button>
          <button 
            onClick={() => setActiveTab('flow')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl",
              activeTab === 'flow' ? "bg-[#B89C6A] text-black" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Activity size={14} /> Bridge Diagnostic
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll} className="p-2 hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors" title="Copiar Tudo (JSON)">
            <Copy size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 font-mono bg-zinc-950/50 scrollbar-hide">
        {activeTab === 'logs' ? (
          <div className="space-y-4">
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 opacity-20">
                <Terminal size={48} />
                <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Nenhum log capturado</p>
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={cn(
                "p-5 rounded-3xl border relative group transition-all",
                log.type === 'error' ? 'bg-red-500/5 border-red-500/20' : 
                log.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 
                'bg-zinc-900/50 border-white/5'
              )}>
                <button 
                  onClick={() => copySingle(log, i)}
                  className="absolute top-4 right-4 p-2 bg-black/50 border border-white/10 rounded-xl text-gray-400 hover:text-[#B89C6A] opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                >
                  {copiedId === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9px] text-zinc-500 font-bold">{log.time}</span>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-widest",
                    log.type === 'error' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 
                    log.type === 'success' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 
                    'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  )}>
                    {log.type}
                  </span>
                </div>
                
                <p className="text-[12px] leading-relaxed text-zinc-100 pr-12 font-medium">{log.message}</p>
                
                {log.data && (
                  <div className="mt-4">
                    <pre className="p-4 bg-black/80 rounded-2xl text-[10px] overflow-x-auto text-blue-300 border border-white/5 shadow-inner">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <FlowDiagnostic />
        )}
      </div>
    </Card>
  );
};
