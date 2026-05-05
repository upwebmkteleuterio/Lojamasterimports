import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maskPhone, maskCPF } from '@/utils/validation';

interface PersonalInfoSectionProps {
  data: any;
  updateField: (field: string, value: string) => void;
}

export const PersonalInfoSection = ({ data, updateField }: PersonalInfoSectionProps) => {
  return (
    <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-[#B89C6A] text-white flex items-center justify-center font-bold text-lg">1</div>
        <h2 className="text-xl font-serif font-bold text-gray-900">Informações Pessoais</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nome Completo</Label>
          <Input 
            value={data.fullName} 
            onChange={(e) => updateField('fullName', e.target.value)} 
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#B89C6A]/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">E-mail</Label>
          <Input 
            value={data.email} 
            disabled 
            className="rounded-2xl h-14 bg-gray-100 border-transparent text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Telefone / WhatsApp</Label>
          <Input 
            value={data.phone} 
            onChange={(e) => updateField('phone', maskPhone(e.target.value))} 
            placeholder="(00) 00000-0000"
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#B89C6A]/30"
          />
        </div>

        <div className="md:col-span-1 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">CPF</Label>
          <Input 
            value={data.cpf} 
            onChange={(e) => updateField('cpf', maskCPF(e.target.value))} 
            placeholder="000.000.000-00"
            className="rounded-2xl h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-1 focus:ring-[#B89C6A]/30"
          />
        </div>
      </div>
    </div>
  );
};