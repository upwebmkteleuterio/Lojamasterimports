import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Terminal, Copy, X, Activity, List, Check } from 'lucide-react';
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
    const text = logs.map(l => `[${l.time}] ${l.type.toUpperCase()}: ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Todos os logs copiados!");
  };

  const copySingle = (log: any, index: number) => {
    const text = `[${log.time}] ${log.type.toUpperCase()}: ${log.message}\nDATA: ${JSON.stringify(log.data, null, 2)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Log copiado!");
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-[#B89C6A] p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] z-[99999] flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border-2 border-[#B89C6A]"
      >
        <Terminal size={24} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-2">MONITOR DE DIAGNÓSTICO</span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[600px] max-h-[85vh] border-2 border-gray-800 shadow-[0_0_60px_rgba(0,0,0,0.7)] z-[99999] bg-black text-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-4 bg-zinc-900 flex items-center justify-between border-b border-gray-800">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('logs')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'logs' ? "text-[#B89C6A]" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <List size={14} /> LOGS DE SISTEMA
          </button>
          <button 
            onClick={() => setActiveTab('flow')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'flow' ? "text-[#B89C6A]" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Activity size={14} /> FLUXO DE DADOS
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-[9px] font-bold uppercase tracking-widest text-[#B89C6A]">
            <Copy size={12} /> COPIAR TUDO
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono bg-zinc-950">
        {activeTab === 'logs' ? (
          <div className="space-y-4 text-[11px]">
            {logs.length === 0 && <p className="text-gray-600 italic text-center py-20 uppercase tracking-widest text-[10px]">Aguardando atividades...</p>}
            {logs.map((log, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border relative group transition-all",
                log.type === 'error' ? 'bg-red-950/30 border-red-900/50' : 
                log.type === 'success' ? 'bg-emerald-950/30 border-emerald-900/50' : 
                'bg-zinc-900/50 border-zinc-800'
              )}>
                {/* Botão de Cópia Individual */}
                <button 
                  onClick={() => copySingle(log, i)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black rounded-lg text-gray-400 hover:text-[#B89C6A] transition-all opacity-0 group-hover:opacity-100 border border-white/5"
                  title="Copiar este log"
                >
                  {copiedId === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-zinc-500 font-bold">{log.time}</span>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter",
                    log.type === 'error' ? 'bg-red-600 text-white' : 
                    log.type === 'success' ? 'bg-emerald-600 text-white' : 
                    'bg-blue-600 text-white'
                  )}>
                    {log.type}
                  </span>
                </div>
                
                <p className="leading-relaxed text-zinc-200 pr-10 font-medium">{log.message}</p>
                
                {log.data && (
                  <div className="mt-3">
                    <pre className="p-4 bg-black rounded-xl text-[10px] overflow-x-auto text-blue-400 border border-white/5 selection:bg-blue-500/30">
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