import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseCurrencyInput } from '@/utils/currency';

interface PricingSectionProps {
  costPrice: number;
  price: number;
  promoPrice: number;
  onChange: (field: string, value: number) => void;
}

export const PricingSection = ({ costPrice, price, promoPrice, onChange }: PricingSectionProps) => {
  const handleInputChange = (field: string, value: string) => {
    const numericValue = parseCurrencyInput(value);
    onChange(field, numericValue);
  };

  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50">
        <CardTitle className="text-sm font-bold text-gray-700">Precificação</CardTitle>
      </CardHeader>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Preço de custo</Label>
          <div className="relative flex items-center">
            <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
            <Input 
              value={formatCurrency(costPrice)}
              onChange={(e) => handleInputChange('cost_price', e.target.value)}
              className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
            Preço de venda <span className="text-red-500 font-bold">*</span>
          </Label>
          <div className="relative flex items-center">
            <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
            <Input 
              value={formatCurrency(price)}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Preço promocional</Label>
          <div className="relative flex items-center">
            <div className="absolute left-4 font-bold text-gray-400 text-sm">R$</div>
            <Input 
              value={formatCurrency(promoPrice)}
              onChange={(e) => handleInputChange('promo_price', e.target.value)}
              className="pl-12 rounded-xl h-14 bg-gray-50/50 border-gray-100 font-medium"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};