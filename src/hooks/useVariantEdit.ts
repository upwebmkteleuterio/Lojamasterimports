import { useState, useEffect } from 'react';
import { ProductVariant } from "@/types/store";
import { diamondDebug } from '@/utils/debug';

export const useVariantEdit = (
  variant: ProductVariant, 
  mainProductData: any, 
  onSave: (v: ProductVariant) => void
) => {
  const [data, setData] = useState<ProductVariant>(variant);

  // Sincroniza o estado interno se a variante injetada mudar
  useEffect(() => {
    setData(variant);
  }, [variant]);

  const handlePullData = () => {
    diamondDebug('info', `Puxando dados globais para variante: ${variant.option_name}`);
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

  const handleSaveInternal = () => {
    diamondDebug('info', `Solicitando salvamento de variante: ${data.option_name}`, {
      preco_venda: data.price,
      preco_custo: data.cost_price,
      sku: data.sku
    });
    onSave(data);
  };

  return {
    data,
    setData,
    handlePullData,
    handleSave: handleSaveInternal
  };
};