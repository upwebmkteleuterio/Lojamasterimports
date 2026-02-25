"use client";

import React from 'react';
import { getSafeProductImage } from '@/utils/imageHandler';

interface ProductGalleryProps {
  image: string;
  name: string;
}

export const ProductGallery = ({ image, name }: ProductGalleryProps) => {
  const safeImage = getSafeProductImage(image);
  
  return (
    <div className="space-y-4">
      {/* Imagem Principal: Ajustada para aspect-square ou altura menor no mobile */}
      <div className="bg-white border border-gray-100 overflow-hidden flex items-center justify-center h-[300px] md:h-[500px]">
        <img 
          src={safeImage} 
          alt={name} 
          className="max-w-full max-h-full object-contain p-4" 
        />
      </div>
      
      {/* Miniaturas */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square border border-gray-100 cursor-pointer bg-gray-50 hover:border-[#D4AF37] transition-colors">
            <img 
              src={safeImage} 
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" 
              alt={`${name} thumb ${i}`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};