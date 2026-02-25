import React from 'react';
import { usePersistence } from '@/hooks/usePersistence';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerData } from '@/types/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, CreditCard, MapPin, Hash, Building2, Map } from 'lucide-react';

const initialData: CustomerData = {
  fullName: '',
  email: '',
  phone: '',
  cpf: '',
  zipCode: '',
  address: '',
  number: '',
  city: '',
  state: '',
};

export const PersonalDataForm = () => {
  // Fix the import path if needed - checking list_files again
  // src/hooks/usePersistence.ts
  const { data, updateField } = usePersistence<CustomerData>('user_profile', initialData);

  const handleChange = (field: keyof CustomerData, value: string) => {
    updateField(field, value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Dados Pessoais */}
      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <User size={20} className="text-[#B89C6A]" /> Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
               Nome Completo
            </Label>
            <div className="relative">
              <Input 
                value={data.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Ex: Maria Silva"
                className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
               E-mail
            </Label>
            <Input 
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="maria@exemplo.com"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
               Telefone
            </Label>
            <Input 
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
               CPF
            </Label>
            <Input 
              value={data.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <MapPin size={20} className="text-[#B89C6A]" /> Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">CEP</Label>
            <Input 
              value={data.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="00000-000"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Endereço</Label>
            <Input 
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, Avenida..."
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Número</Label>
            <Input 
              value={data.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="123"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Cidade</Label>
            <Input 
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Sua Cidade"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</Label>
            <Input 
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="UF"
              className="rounded-xl border-gray-100 bg-gray-50/30 focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400">
        Seus dados são salvos automaticamente para facilitar suas próximas compras.
      </p>
    </div>
  );
};
