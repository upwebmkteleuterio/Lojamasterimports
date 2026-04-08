"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductReviews } from './ProductReviews';
import { ProductQuestions } from './ProductQuestions';

export const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'questions'>('reviews');

  // Lógica simples para o contador da aba (sempre +1 pela avaliação base simulada)
  const realReviewsCount = 0; 
  const displayCount = realReviewsCount + 1;

  return (
    <section className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* Header das Abas */}
        <div className="flex">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "flex-1 py-6 text-center transition-all duration-300 border-b-2",
              activeTab === 'reviews' 
                ? "bg-white border-transparent text-[#333]" 
                : "bg-gray-50/50 border-gray-50 text-gray-400 hover:text-gray-600"
            )}
          >
            <span className="text-xl md:text-3xl font-serif">Avaliações ({displayCount})</span>
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={cn(
              "flex-1 py-6 text-center transition-all duration-300 border-b-2",
              activeTab === 'questions' 
                ? "bg-white border-transparent text-[#333]" 
                : "bg-gray-50/50 border-gray-50 text-gray-400 hover:text-gray-600"
            )}
          >
            <span className="text-xl md:text-3xl font-serif">Dúvidas</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="py-12">
          {activeTab === 'reviews' ? <ProductReviews /> : <ProductQuestions />}
        </div>
      </div>
    </section>
  );
};