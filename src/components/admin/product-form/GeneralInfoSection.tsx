import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';

interface GeneralInfoSectionProps {
  name: string;
  description: string;
  isActive: boolean;
  onChange: (field: string, value: any) => void;
}

export const GeneralInfoSection = ({ name, description, isActive, onChange }: GeneralInfoSectionProps) => {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50">
        <CardTitle className="text-sm font-bold text-gray-700">Detalhes do produto</CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Disponível para venda <HelpCircle size={14} className="inline ml-1 text-gray-300" /></Label>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={v => onChange('is_active', v)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{isActive ? 'SIM' : 'NÃO'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              Nome do produto <span className="text-red-500 font-bold">*</span>
            </Label>
            <Input 
              value={name} 
              onChange={e => onChange('name', e.target.value)} 
              placeholder="Ex: Anel Diamond Gold"
              className="rounded-xl h-12 bg-gray-50/50 border-gray-100" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Descrição</Label>
            <Textarea 
              value={description} 
              onChange={e => onChange('description', e.target.value)} 
              placeholder="Conte detalhes sobre o produto..."
              className="rounded-xl min-h-[150px] bg-gray-50/50 border-gray-100" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};