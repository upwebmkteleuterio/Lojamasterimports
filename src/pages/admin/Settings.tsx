"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Store, Phone, Mail, MapPin, Image as ImageIcon, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';
import { runDeepScan, traceSaveFlow } from '@/utils/integrityDiagnostic';
import { cn } from '@/lib/utils';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deepScanResults, setDeepScanResults] = useState<any[]>([]);
  const [config, setConfig] = useState({
    id: null as string | null,
    store_name: '',
    logo_url: '',
    support_phone: '',
    support_email: '',
    address_full: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    diamondDebug('info', 'Iniciando carga de configurações (Resiliência PGRST116)...');
    try {
      // Mudamos de maybeSingle() para select().limit(1) para evitar erro de múltiplas linhas
      const { data, error } = await supabase
        .from('store_configs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        diamondDebug('error', 'Falha na ponte de dados', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const entry = data[0];
        diamondDebug('success', 'Configuração mestre localizada.', entry);
        setConfig(entry);
        
        const scan = await runDeepScan('store_configs', entry.id);
        setDeepScanResults(scan);
      } else {
        diamondDebug('info', 'Nenhum registro encontrado. O formulário criará o primeiro.');
      }
    } catch (error: any) {
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    traceSaveFlow('store_configs', config);
    
    try {
      const payload = { ...config };
      // Se não temos ID, o Supabase criará um novo. Se temos, ele atualizará.
      if (!payload.id) delete (payload as any).id;

      diamondDebug('info', 'Executando UPSERT controlado...', payload);
      
      const { data, error } = await supabase
        .from('store_configs')
        .upsert({ 
          ...payload,
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) {
        diamondDebug('error', 'Erro no UPSERT', error);
        throw error;
      }
      
      diamondDebug('success', 'Persistência confirmada pelo banco.', data);
      if (data) setConfig(data);
      toast.success("Configurações atualizadas!");
      
      // Recarrega o scan para atualizar o banner de integridade
      const scan = await runDeepScan('store_configs', data.id);
      setDeepScanResults(scan);
    } catch (error: any) {
      diamondDebug('error', 'Falha crítica no salvamento', error);
      toast.error("Erro ao salvar mudanças.");
    } finally {
      setSaving(false);
    }
  };

  const isBridgeOk = deepScanResults.length > 0 && deepScanResults.every(r => r.success);

  return (
    <AdminLayout 
      title="Configurações da Loja" 
      actions={
        <Button onClick={handleSave} disabled={saving} className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-[#B89C6A]/20">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
          {saving ? 'Gravar Mudanças' : 'Salvar Alterações'}
        </Button>
      }
    >
      <div className={cn(
        "mb-8 p-6 rounded-[32px] border-2 flex items-center justify-between transition-all",
        loading ? "bg-gray-50 border-gray-100 opacity-50" :
        isBridgeOk ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl", isBridgeOk ? "bg-green-600 text-white" : "bg-red-600 text-white")}>
            {isBridgeOk ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Integridade de Dados</p>
            <p className="font-bold">{loading ? 'Validando...' : isBridgeOk ? 'Conexão Estável' : 'Registro inconsistente no banco'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Store size={16} /> Identidade da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Nome da Loja</Label>
              <Input 
                value={config.store_name}
                onChange={(e) => setConfig({...config, store_name: e.target.value})}
                placeholder="Ex: Diamond Luxury Store"
                className="rounded-2xl border-gray-100 bg-gray-50 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <ImageIcon size={14} /> URL da Logomarca
              </Label>
              <Input 
                value={config.logo_url}
                onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                placeholder="https://..."
                className="rounded-2xl border-gray-100 bg-gray-50 h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Phone size={16} /> Contato e Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Telefone</Label>
                <Input 
                  value={config.support_phone}
                  onChange={(e) => setConfig({...config, support_phone: e.target.value})}
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">E-mail</Label>
                <Input 
                  value={config.support_email}
                  onChange={(e) => setConfig({...config, support_email: e.target.value})}
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <MapPin size={14} /> Endereço Sede
              </Label>
              <Input 
                value={config.address_full}
                onChange={(e) => setConfig({...config, address_full: e.target.value})}
                className="rounded-2xl border-gray-100 bg-gray-50 h-12"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;