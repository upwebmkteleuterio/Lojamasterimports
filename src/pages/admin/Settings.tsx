"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Store, Phone, Mail, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
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
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConfig({
          store_name: data.store_name || '',
          logo_url: data.logo_url || '',
          support_phone: data.support_phone || '',
          support_email: data.support_email || '',
          address_full: data.address_full || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_configs')
        .upsert({ 
          ...config,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'id' });

      if (error) throw error;
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Configurações">Carregando...</AdminLayout>;

  return (
    <AdminLayout 
      title="Configurações da Loja" 
      actions={
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-8 h-12 font-bold text-xs uppercase tracking-widest gap-2"
        >
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
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
                placeholder="https://link-da-logo.com/logo.png"
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
                <Label className="text-xs font-bold text-gray-500 uppercase">Telefone de Suporte</Label>
                <Input 
                  value={config.support_phone}
                  onChange={(e) => setConfig({...config, support_phone: e.target.value})}
                  placeholder="(00) 0000-0000"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">E-mail de Suporte</Label>
                <Input 
                  value={config.support_email}
                  onChange={(e) => setConfig({...config, support_email: e.target.value})}
                  placeholder="suporte@diamond.com"
                  className="rounded-2xl border-gray-100 bg-gray-50 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <MapPin size={14} /> Endereço Físico / Sede
              </Label>
              <Input 
                value={config.address_full}
                onChange={(e) => setConfig({...config, address_full: e.target.value})}
                placeholder="Rua Exemplo, 123 - Cidade, UF"
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