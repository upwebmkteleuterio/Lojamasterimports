"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Store, Phone, Mail, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { diamondDebug } from '@/utils/debug';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    try {
      const { data, error } = await supabase
        .from('store_configs')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...config };
      if (!payload.id) delete (payload as any).id;

      const { data, error } = await supabase
        .from('store_configs')
        .upsert({ 
          ...payload,
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) setConfig(data);
      toast.success("Configurações atualizadas!");
      
      // Força atualização do título da aba imediatamente
      document.title = data.store_name;
      
    } catch (error: any) {
      toast.error("Erro ao salvar mudanças.");
    } finally {
      setSaving(false);
    }
  };

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