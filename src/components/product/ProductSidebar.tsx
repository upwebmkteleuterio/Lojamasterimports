"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Truck, Check } from 'lucide-react';
import { Product, ProductVariant } from '@/types/store';
import { cn } from '@/lib/utils';

interface ProductSidebarProps {
  product: Product;
  onAddToCart: (quantity: number, selectedVariant?: ProductVariant) => void;
}

export const ProductSidebar = ({ product, onAddToCart }: ProductSidebarProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Agrupa as variantes por nome de atributo (ex: "Cor", "Tamanho")
  const variationsMap = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    
    const map: Record<string, ProductVariant[]> = {};
    product.variants.forEach(v => {
      if (!map[v.attribute_name]) map[v.attribute_name] = [];
      map[v.attribute_name].push(v);
    });
    return map;
  }, [product.variants]);

  // Se houver variantes, os preços e imagens mudam baseados na seleção
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentPromoPrice = selectedVariant ? selectedVariant.promo_price : product.promotionalPrice;
  const hasPromo = currentPromoPrice && currentPromoPrice > 0;
  const displayPrice = hasPromo ? currentPromoPrice : currentPrice;

  // Se uma variante com imagem for selecionada, ela deve ser a "capa"
  // (A lógica de galeria pegará isso se passarmos via prop superior, mas aqui cuidamos do preço)

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-5xl font-serif font-light text-[#333] mb-6 leading-tight">
        {product.name}
      </h1>

      <div className="mb-8 flex flex-col gap-1">
        {hasPromo && (
          <span className="text-sm md:text-lg text-gray-400 line-through font-light">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentPrice)}
          </span>
        )}
        <span className="text-3xl md:text-4xl font-bold text-[#D4AF37]">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice || 0)}
        </span>
      </div>

      {/* SELEÇÃO DE VARIANTES */}
      {variationsMap && (
        <div className="space-y-6 mb-10">
          {Object.entries(variationsMap).map(([attrName, options]) => (
            <div key={attrName} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{attrName}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.id || opt.option_name}
                    onClick={() => setSelectedVariant(opt)}
                    className={cn(
                      "px-6 py-3 border text-xs font-bold transition-all relative",
                      selectedVariant?.id === opt.id || selectedVariant?.option_name === opt.option_name
                        ? "border-black bg-black text-white" 
                        : "border-gray-200 text-gray-500 hover:border-black"
                    )}
                  >
                    {opt.option_name}
                    {(selectedVariant?.id === opt.id || selectedVariant?.option_name === opt.option_name) && (
                      <Check size={10} className="absolute top-1 right-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-3 md:gap-4 mb-10">
        <div className="flex items-center border border-gray-200 h-14 bg-white min-w-[120px] md:min-w-[140px]">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex-1 flex items-center justify-center h-full text-gray-400 hover:text-black transition-colors">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-serif text-lg">{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)} className="flex-1 flex items-center justify-center h-full text-gray-400 hover:text-black transition-colors">
            <Plus size={16} />
          </button>
        </div>
        
        <Button 
          onClick={() => onAddToCart(quantity, selectedVariant || undefined)}
          disabled={variationsMap && !selectedVariant}
          className="flex-1 h-14 rounded-none bg-[#D4AF37] hover:bg-[#b8962d] text-white font-bold text-sm md:text-lg tracking-widest disabled:opacity-50 disabled:bg-gray-200"
        >
          {variationsMap && !selectedVariant ? 'SELECIONE UMA OPÇÃO' : 'COMPRAR'}
        </Button>
      </div>

      {/* Escassez Box */}
      <div className="border border-gray-100 p-8 text-center space-y-4 mb-10">
        <p className="font-serif text-[#333]">
          Apenas <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#333] text-white text-xs font-sans align-middle mx-1">
            {selectedVariant ? selectedVariant.stock : product.stock}
          </span> unidades em estoque
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#444] w-[30%]" />
        </div>
      </div>

      {/* Simular Frete */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[#333] font-serif text-sm">
          <Truck size={18} />
          <span>Simular frete</span>
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input placeholder="00000-000" className="rounded-none h-11 border-gray-200" />
          <Button variant="outline" className="rounded-none h-11 border-gray-200 px-6 font-serif uppercase text-xs tracking-widest">OK</Button>
        </div>
      </div>
    </div>
  );
};