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
    <div className="bg-white p-6 rounded-3xl flex gap-6 items-center shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4">
      <div className="w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
        <img 
          src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col h-full justify-between py-2">
        <div>
          <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900 truncate">{item.name}</h3>
          
          {item.selectedVariant && (
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest">
                <Tag size={10} className="text-[#B89C6A]" /> {item.selectedVariant.attribute_name}: {item.selectedVariant.option_name}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Unitário</span>
             <span className="font-bold text-[#B89C6A] text-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-6">
        <button 
          onClick={() => onRemove(item.id)}
          className="text-gray-300 hover:text-red-500 transition-colors p-2"
        >
          <Trash2 size={20} />
        </button>
        
        <div className="flex items-center border border-gray-100 rounded-2xl px-4 py-2 gap-6 bg-gray-50 shadow-inner">
          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="text-gray-400 hover:text-black transition-colors">
            <Minus size={16} />
          </button>
          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="text-gray-400 hover:text-black transition-colors">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};