"use client";

import React from 'react';

interface ProductDescriptionProps {
  name: string;
  description: string;
}

export const ProductDescription = ({ name, description }: ProductDescriptionProps) => {
  return (
    <section className="py-16 md:py-24 border-t border-gray-100 bg-[#fdfdfd]">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-serif text-[#444] text-center mb-12">
          {name}
        </h2>
        
        <div className="space-y-8 text-gray-600 leading-relaxed font-light text-center md:text-left">
          <p>
            O <strong>{name}</strong> da Diamond Store é a verdadeira expressão de elegância e sofisticação. 
            Com design contemporâneo e refinado, cada detalhe foi meticulosamente pensado para oferecer beleza atemporal e brilho deslumbrante.
          </p>
          
          <p className="italic">
            {description}
          </p>
          
          <p>
            Ideal para ocasiões especiais ou para dar um toque de luxo ao look do dia a dia, este item é perfeito para quem deseja destacar sua personalidade com muito estilo. 
            O acabamento impecável e a qualidade superior são marcas registradas da Diamond Store, garantindo durabilidade e conforto incomparáveis.
          </p>
          
          <p className="font-serif text-[#333] text-lg text-center mt-12">
            Brilhe com a Diamond Store, onde a elegância encontra o luxo em cada detalhe.
          </p>
        </div>
      </div>
    </section>
  );
};