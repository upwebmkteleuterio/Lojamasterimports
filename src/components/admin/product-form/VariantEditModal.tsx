"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProductVariant } from "@/types/store";
import { formatCurrency, parseCurrencyInput } from "@/utils/currency";
import { Truck, RotateCcw, Image as ImageIcon } from "lucide-react";

interface VariantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant;
  onSave: (variant: ProductVariant) => void;
  mainProductData: any;
}

export const VariantEditModal = ({ isOpen, onClose, variant, onSave, mainProductData }: VariantEditModalProps) => {
  const [data, setData] = React.useState<ProductVariant>(variant);

  React.useEffect(() => {
    setData(variant);
  }, [variant]);

  const handlePullData = () => {
    setData(prev => ({
      ...prev,
      price: mainProductData.price || 0,
      cost_price: mainProductData.cost_price || 0,
      promo_price: mainProductData.promo_price || 0,
      weight: mainProductData.weight || 0,
      height: mainProductData.height || 0,
      width: mainProductData.width || 0,
      length: mainProductData.length || 0,
      sku: mainProductData.sku ? `${mainProductData.sku}-${prev.option_name.toUpperCase()}` : prev.sku
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            Editar opção: <span className="text-[#B89C6A]">{data.option_name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
             <div className="flex items-center gap-3">
                <Switch checked={data.is_active} onCheckedChange={(v) => setData({...data, is_active: v})} />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Disponível para venda</span>
             </div>
             <Button 
              variant="outline" 
              onClick={handlePullData}
              className="text-[10px] h-8 rounded-full border-[#B89C6A] text-[#B89C6A] font-bold uppercase tracking-widest"
             >
               <RotateCcw size={12} className="mr-1" /> Puxar dados do principal
             </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço de custo</Label>
              <Input 
                value={formatCurrency(data.cost_price)}
                onChange={(e) => setData({...data, cost_price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço de venda</Label>
              <Input 
                value={formatCurrency(data.price)}
                onChange={(e) => setData({...data, price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço promo</Label>
              <Input 
                value={formatCurrency(data.promo_price)}
                onChange={(e) => setData({...data, promo_price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">SKU</Label>
              <Input value={data.sku} onChange={e => setData({...data, sku: e.target.value})} className="h-12 rounded-xl bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Código de Barras</Label>
              <Input value={data.barcode} onChange={e => setData({...data, barcode: e.target.value})} className="h-12 rounded-xl bg-gray-50" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2">
              <Truck size={14} /> Peso e Dimensões
            </Label>
            <div className="grid grid-cols-4 gap-4">
              <Input placeholder="Peso (kg)" type="number" value={data.weight} onChange={e => setData({...data, weight: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50" />
              <Input placeholder="Alt (cm)" type="number" value={data.height} onChange={e => setData({...data, height: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50" />
              <Input placeholder="Larg (cm)" type="number" value={data.width} onChange={e => setData({...data, width: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50" />
              <Input placeholder="Comp (cm)" type="number" value={data.length} onChange={e => setData({...data, length: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8">Cancelar</Button>
          <Button onClick={() => onSave(data)} className="bg-gray-900 text-white rounded-full px-12 h-12 font-bold uppercase tracking-widest text-[10px]">Salvar Opção</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};