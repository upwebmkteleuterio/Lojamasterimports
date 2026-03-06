"use client";

import React from 'react';

interface ProductDescriptionProps {
  name: string;
  description: string;
}

export const ProductDescription = ({ name, description }: ProductDescriptionProps) => {
  if (!description) return null;

  return (
    <section className="py-16 md:py-24 border-t border-gray-100 bg-[#fdfdfd]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-serif text-[#444] text-center mb-12 uppercase tracking-widest">
          Sobre o {name}
        </h2>
        
        <div className="text-gray-600 leading-relaxed font-light text-justify md:text-left whitespace-pre-wrap">
          {description}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-50 text-center">
          <p className="font-serif text-[#B89C6A] text-lg">
            Qualidade e sofisticação Diamond Store
          </p>
        </div>
      </div>
    </section>
  );
};