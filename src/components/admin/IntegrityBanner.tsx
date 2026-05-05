"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Layout, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { subscribeToLogs } from '@/utils/debug';

export const IntegrityBanner = () => {
  const [status, setStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState({
    db: 0,
    ui: 0,
    permissions: 'Aguardando...'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    
    return subscribeToLogs((logs) => {
      const lastError = logs.find(l => l.type === 'error' && l.message.includes('[INTEGRITY]'));
      if (lastError) {
        setStatus(lastError.message.includes('Quebrada') ? 'critical' : 'warning');
        if (lastError.data) {
          setStats(prev => ({
            ...prev,
            db: lastError.data.dbRaw ? 1 : 0,
            ui: lastError.data.uiState ? 1 : 0
          }));
        }
      } else {
        setStatus('healthy');
      }
    });
  }, []);

  return (
    <div className={cn(
      "w-full px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all border-b",
      status === 'healthy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
      status === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
      "bg-red-500/10 border-red-500/20 text-red-600"
    )}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {status === 'healthy' ? <CheckCircle size={14} /> : <AlertTriangle size={14} className="animate-pulse" />}
          <span>Status: {status === 'healthy' ? 'Integridade OK' : status === 'warning' ? 'Divergência' : 'Ponte Quebrada'}</span>
        </div>
        
        <div className="h-3 w-px bg-current opacity-20" />
        
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} />
          <span>RLS: {session ? 'Autenticado' : 'Público'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database size={14} />
          <span>Banco: {stats.db}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Layout size={14} />
          <span>UI: {stats.ui}</span>
        </div>

        {status === 'critical' && (
          <div className="ml-4 px-2 py-0.5 bg-red-600 text-white rounded animate-bounce">
            ALERTA CRÍTICO
          </div>
        )}
      </div>
    </div>
  );
};
