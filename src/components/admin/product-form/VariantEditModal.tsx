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
import { Truck, RotateCcw, ImageIcon } from "lucide-react";
import { useVariantEdit } from '@/hooks/useVariantEdit';

interface VariantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ProductVariant;
  onSave: (variant: ProductVariant) => void;
  mainProductData: any;
}

export const VariantEditModal = ({ isOpen, onClose, variant, onSave, mainProductData }: VariantEditModalProps) => {
  const { data, setData, handlePullData, handleSave } = useVariantEdit(variant, mainProductData, onSave);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl">
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

          {/* ÁREA DA IMAGEM DA VARIAÇÃO */}
          <div className="space-y-4 p-6 border border-[#B89C6A]/10 bg-[#B89C6A]/5 rounded-3xl">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-2">
              <ImageIcon size={14} /> Imagem Específica desta Opção
            </Label>
            <div className="flex gap-4 items-center">
              <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {data.main_image ? (
                  <img src={data.main_image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <ImageIcon size={24} className="text-gray-200" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] text-gray-400">Cole o link da imagem que deve aparecer ao selecionar esta variação.</p>
                <Input 
                  value={data.main_image || ''} 
                  onChange={e => setData({...data, main_image: e.target.value})}
                  placeholder="https://..."
                  className="h-10 rounded-xl bg-white border-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço de custo</Label>
              <Input 
                value={formatCurrency(data.cost_price)}
                onChange={(e) => setData({...data, cost_price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50 focus:bg-white border-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço de venda</Label>
              <Input 
                value={formatCurrency(data.price)}
                onChange={(e) => setData({...data, price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50 focus:bg-white border-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Preço promo</Label>
              <Input 
                value={formatCurrency(data.promo_price)}
                onChange={(e) => setData({...data, promo_price: parseCurrencyInput(e.target.value)})}
                className="h-12 rounded-xl bg-gray-50 focus:bg-white border-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">SKU</Label>
              <Input value={data.sku} onChange={e => setData({...data, sku: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-gray-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-gray-400">Código de Barras</Label>
              <Input value={data.barcode} onChange={e => setData({...data, barcode: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-gray-100" />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-50">
            <Label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-2 mb-4">
              <Truck size={14} /> Peso e Dimensões
            </Label>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-gray-400 uppercase">Peso (kg)</Label>
                <Input type="number" value={data.weight} onChange={e => setData({...data, weight: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50 border-gray-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-gray-400 uppercase">Altura (cm)</Label>
                <Input type="number" value={data.height} onChange={e => setData({...data, height: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50 border-gray-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-gray-400 uppercase">Largura (cm)</Label>
                <Input type="number" value={data.width} onChange={e => setData({...data, width: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50 border-gray-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-gray-400 uppercase">Comp. (cm)</Label>
                <Input type="number" value={data.length} onChange={e => setData({...data, length: Number(e.target.value)})} className="h-10 rounded-lg bg-gray-50 border-gray-100" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-xs font-bold uppercase tracking-widest text-gray-400">Cancelar</Button>
          <Button onClick={handleSave} className="bg-gray-900 hover:bg-black text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/10">
            Salvar Opção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};