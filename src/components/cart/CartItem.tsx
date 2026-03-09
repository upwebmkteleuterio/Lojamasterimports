"use client";

import React from 'react';
import { OrderItem } from '@/types/store';
import { Trash2, Minus, Plus, Tag } from 'lucide-react';
import { getSafeProductImage } from '@/utils/imageHandler';

interface CartItemProps {
  item: OrderItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl flex gap-4 md:gap-6 items-start relative shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4">
      {/* Botão Remover - Absoluto no Mobile/Desktop para ganhar espaço */}
      <button 
        onClick={() => onRemove(item.id)}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-2 z-10"
      >
        <Trash2 size={18} />
      </button>

      {/* Imagem do Produto */}
      <div className="w-20 h-28 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
        <img 
          src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Conteúdo Central */}
      <div className="flex-1 min-w-0 flex flex-col min-h-[112px] md:min-h-[160px] justify-between">
        <div className="pr-8"> {/* Padding para não bater no ícone de lixeira */}
          <h3 className="font-serif text-base md:text-xl font-bold text-gray-900 truncate mb-1">
            {item.name}
          </h3>
          
          {item.selectedVariant && (
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-50 border border-gray-100 text-[9px] md:text-[10px] font-bold text-gray-400 px-2 md:px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
                <Tag size={8} className="text-[#B89C6A]" /> {item.selectedVariant.option_name}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé do Item: Preço e Quantidade */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Preço Unitário</span>
             <span className="font-bold text-[#B89C6A] text-base md:text-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
            </span>
          </div>

          <div className="flex items-center border border-gray-100 rounded-xl px-3 py-1.5 gap-4 bg-gray-50 shadow-inner w-fit">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
              className="text-gray-400 hover:text-black transition-colors p-1"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold min-w-[12px] text-center">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
              className="text-gray-400 hover:text-black transition-colors p-1"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};