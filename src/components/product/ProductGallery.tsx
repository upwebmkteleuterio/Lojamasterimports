"use client";

import React from 'react';
import { getSafeProductImage } from '@/utils/imageHandler';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  mainImage: string;
  activeImage: string;
  gallery: string[];
  name: string;
  onImageSelect: (url: string) => void;
}

export const ProductGallery = ({ mainImage, activeImage, gallery, name, onImageSelect }: ProductGalleryProps) => {
  // Combinamos a imagem principal com a galeria, removendo duplicatas ou vazios
  const allImages = Array.from(new Set([mainImage, ...(gallery || [])])).filter(img => img && img.trim() !== "");
  
  return (
    <div className="space-y-4">
      {/* Imagem Principal em Destaque */}
      <div className="bg-white border border-gray-100 overflow-hidden flex items-center justify-center h-[300px] md:h-[500px] rounded-none group">
        <img 
          src={getSafeProductImage(activeImage)} 
          alt={name} 
          className="max-w-full max-h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
        />
      </div>
      
      {/* Miniaturas */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
          {allImages.map((img, i) => (
            <button 
              key={i} 
              onClick={() => onImageSelect(img)}
              className={cn(
                "aspect-square border transition-all duration-300 bg-white overflow-hidden p-1",
                activeImage === img ? "border-black" : "border-gray-100 hover:border-gray-300"
              )}
            >
              <img 
                src={getSafeProductImage(img)} 
                className={cn(
                  "w-full h-full object-contain transition-opacity",
                  activeImage === img ? "opacity-100" : "opacity-60 hover:opacity-100"
                )} 
                alt={`${name} miniatura ${i + 1}`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};