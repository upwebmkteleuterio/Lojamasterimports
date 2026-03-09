"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductVariant } from "@/types/store";
import { cn } from "@/lib/utils";
import { Check, ShoppingBag } from "lucide-react";
import { getSafeProductImage } from '@/utils/imageHandler';

interface VariationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (variant: ProductVariant) => void;
}

export const VariationSelectionModal = ({ isOpen, onClose, product, onConfirm }: VariationSelectionModalProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (!product.variants || product.variants.length === 0) return null;

  // Agrupa variações por nome de atributo (Cor, Tamanho, etc)
  const variationsMap: Record<string, ProductVariant[]> = {};
  product.variants.forEach(v => {
    if (!variationsMap[v.attribute_name]) variationsMap[v.attribute_name] = [];
    variationsMap[v.attribute_name].push(v);
  });

  const handleConfirm = () => {
    if (selectedVariant) {
      onConfirm(selectedVariant);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="relative h-48 bg-gray-50 flex items-center justify-center border-b overflow-hidden">
          <img 
            src={getSafeProductImage(selectedVariant?.main_image || product.image)} 
            className="h-full w-full object-cover transition-all duration-500" 
            alt="Preview" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <DialogHeader className="absolute bottom-4 left-6 text-white text-left">
            <DialogTitle className="text-xl font-serif">{product.name}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Por favor, selecione uma opção abaixo:
          </p>

          <div className="space-y-6">
            {Object.entries(variationsMap).map(([attrName, options]) => (
              <div key={attrName} className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{attrName}</span>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.id || opt.option_name}
                      onClick={() => setSelectedVariant(opt)}
                      className={cn(
                        "px-4 py-3 border text-xs font-bold transition-all flex items-center justify-between rounded-xl",
                        (selectedVariant?.id === opt.id || selectedVariant?.option_name === opt.option_name)
                          ? "border-black bg-black text-white" 
                          : "border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {opt.option_name}
                      {(selectedVariant?.id === opt.id || selectedVariant?.option_name === opt.option_name) && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-400">Valor:</span>
              <span className="text-2xl font-bold text-[#D4AF37]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedVariant ? selectedVariant.price : product.price)}
              </span>
            </div>
            
            <Button 
              onClick={handleConfirm}
              disabled={!selectedVariant}
              className="w-full h-14 rounded-full bg-gray-900 hover:bg-black text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-black/10 disabled:opacity-30"
            >
              <ShoppingBag size={18} className="mr-2" /> Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};