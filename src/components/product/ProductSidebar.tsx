"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Truck, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Product, ProductVariant } from '@/types/store';
import { cn } from '@/lib/utils';

interface ProductSidebarProps {
  product: Product;
  onAddToCart: (quantity: number, selectedVariant?: ProductVariant) => void;
  onVariantSelect?: (variant: ProductVariant) => void;
  onRequestSelection?: () => void;
}

export const ProductSidebar = ({ product, onAddToCart, onVariantSelect, onRequestSelection }: ProductSidebarProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const handleCalculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setShippingError("CEP inválido. Deve conter 8 dígitos.");
      return;
    }
    setLoadingShipping(true);
    setShippingError('');
    setShippingOptions([]);

    try {
      const response = await fetch('https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/frenet-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientCep: cleanCep,
          items: [
            {
              id: product.id,
              name: product.name,
              price: product.price,
              promo_price: product.promotionalPrice,
              weight: product.weight || 0.3,
              width: product.width || 15,
              height: product.height || 5,
              length: product.length || 15,
              quantity: quantity,
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao calcular o frete.");
      }

      setShippingOptions(data.services || []);
      if (data.services && data.services.length === 0) {
        setShippingError("Nenhuma opção de entrega encontrada para este CEP.");
      }
    } catch (err: any) {
      console.error(err);
      setShippingError(err.message || "Erro na conexão. Tente novamente.");
    } finally {
      setLoadingShipping(false);
    }
  };

  // Sorteia um número entre 15 e 20 para o gatilho de escassez
  const simulatedStock = useMemo(() => Math.floor(Math.random() * (20 - 15 + 1)) + 15, []);

  const variationsMap = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    
    const map: Record<string, ProductVariant[]> = {};
    product.variants.forEach(v => {
      if (!map[v.attribute_name]) map[v.attribute_name] = [];
      map[v.attribute_name].push(v);
    });
    return map;
  }, [product.variants]);

  const handleSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (onVariantSelect) onVariantSelect(variant);
  };

  const handleBuyClick = () => {
    if (variationsMap && !selectedVariant) {
      if (onRequestSelection) onRequestSelection();
      return;
    }
    onAddToCart(quantity, selectedVariant || undefined);
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentPromoPrice = selectedVariant ? selectedVariant.promo_price : product.promotionalPrice;
  const hasPromo = currentPromoPrice && currentPromoPrice > 0;
  const displayPrice = hasPromo ? currentPromoPrice : currentPrice;

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

      {variationsMap && (
        <div className="space-y-6 mb-10">
          {Object.entries(variationsMap).map(([attrName, options]) => (
            <div key={attrName} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{attrName}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.id || opt.option_name}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "px-6 py-3 border text-xs font-bold transition-all relative rounded-none",
                      (selectedVariant?.id === opt.id || selectedVariant?.option_name === opt.option_name)
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
          onClick={handleBuyClick}
          className={cn(
            "flex-1 h-14 rounded-none font-bold text-sm md:text-lg tracking-widest transition-all",
            (variationsMap && !selectedVariant) 
              ? "bg-gray-100 text-gray-400 hover:bg-gray-200" 
              : "bg-[#D4AF37] hover:bg-[#b8962d] text-white"
          )}
        >
          {variationsMap && !selectedVariant ? (
            <span className="flex items-center gap-2"><AlertCircle size={18} /> SELECIONE UMA OPÇÃO</span>
          ) : 'COMPRAR'}
        </Button>
      </div>

      <div className="border border-gray-100 p-8 text-center space-y-4 mb-10">
        <p className="font-serif text-[#333]">
          Apenas <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#333] text-white text-xs font-sans align-middle mx-1">
            {simulatedStock}
          </span> unidades em estoque
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#444] w-[30%]" />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[#333] font-serif text-sm">
          <Truck size={18} />
          <span>Simular frete</span>
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input
            value={cep}
            onChange={(e) => setCep(formatCEP(e.target.value))}
            placeholder="00000-000"
            className="rounded-none h-11 border-gray-200"
          />
          <Button
            onClick={handleCalculateShipping}
            disabled={loadingShipping}
            variant="outline"
            className="rounded-none h-11 border-gray-200 px-6 font-serif uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            {loadingShipping ? <Loader2 size={14} className="animate-spin" /> : "OK"}
          </Button>
        </div>

        {shippingError && (
          <p className="text-xs text-red-500 font-sans">{shippingError}</p>
        )}

        {shippingOptions.length > 0 && (
          <div className="bg-gray-50/50 p-4 border border-gray-100 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Opções disponíveis:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {shippingOptions.map((opt, idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-gray-100/50 pb-2 last:border-none last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-serif font-medium text-gray-800">{opt.name}</span>
                    <span className="text-[10px] text-gray-400 font-sans">Chega em até {opt.deliveryTime} {opt.deliveryTime === 1 ? 'dia útil' : 'dias úteis'}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {opt.price === 0 ? "Grátis" : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opt.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};