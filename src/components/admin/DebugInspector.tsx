import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Terminal, Copy, X, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToLogs, getLogs } from '@/utils/debug';

export const DebugInspector = () => {
  const [logs, setLogs] = useState(getLogs());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return subscribeToLogs(setLogs);
  }, []);

  const copyLogs = () => {
    const text = logs.map(l => `[${l.time}] ${l.type.toUpperCase()}: ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Logs copiados!");
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-[#B89C6A] p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] z-[99999] flex items-center gap-2 hover:scale-110 active:scale-95 transition-all border border-[#B89C6A]/20"
      >
        <Terminal size={24} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-2">Monitor Adm</span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] max-h-[80vh] border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[99999] bg-gray-900 text-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-4 bg-black flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#B89C6A]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A]">SISTEMA DE DIAGNÓSTICO</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLogs} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400" title="Copiar logs">
            <Copy size={14} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-gray-400">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] bg-black/40">
        {logs.length === 0 && <p className="text-gray-500 italic text-center py-10 uppercase tracking-widest text-[9px]">Nenhuma atividade detectada...</p>}
        {logs.map((log, i) => (
          <div key={i} className={`p-3 rounded-xl border ${
            log.type === 'error' ? 'bg-red-500/10 border-red-500/20' : 
            log.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 
            'bg-gray-800/30 border-gray-800'
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] text-gray-500 font-bold">{log.time}</span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                log.type === 'error' ? 'bg-red-500 text-white' : 
                log.type === 'success' ? 'bg-green-500 text-white' : 
                'bg-blue-500 text-white'
              }`}>
                {log.type}
              </span>
            </div>
            <p className="leading-relaxed text-gray-200">{log.message}</p>
            {log.data && (
              <details className="mt-2">
                <summary className="text-[9px] text-gray-500 cursor-pointer hover:text-gray-300 uppercase font-bold tracking-tighter">Ver JSON bruto enviado</summary>
                <pre className="mt-2 p-3 bg-black/60 rounded-xl text-[9px] overflow-x-auto text-blue-300 border border-gray-800">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};