"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProductReviews = () => {
  // Mock de dados para simular o que virá do Supabase futuramente
  const reviews = [
    {
      id: 1,
      author: "Helena",
      date: "31/01/2025",
      rating: 5,
      content: "Simplesmente deslumbrante! Superou todas as minhas expectativas! O brilho, a delicadeza e a qualidade são impecáveis. Me sinto elegante e sofisticada sempre que uso!",
      images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200"]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-10">
      {/* Coluna de Resumo */}
      <div className="md:col-span-4 space-y-8">
        <div className="text-left">
          <h2 className="text-6xl font-bold text-[#333] mb-2">5.0</h2>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#E5B343" color="#E5B343" />)}
          </div>
          <p className="text-sm text-gray-500 font-serif">baseada em 1 avaliação</p>
        </div>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-4 text-xs font-serif text-gray-400">
              <span className="w-4">{star} <Star size={10} className="inline mb-1" /></span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-[#E5B343] ${star === 5 ? 'w-full' : 'w-0'}`} />
              </div>
              <span className="w-4 text-right">{star === 5 ? '1' : '0'}</span>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full rounded-none border-gray-900 font-serif uppercase text-xs tracking-widest py-6 hover:bg-gray-900 hover:text-white transition-all">
          AVALIAR PRODUTO
        </Button>
      </div>

      {/* Coluna de Lista de Depoimentos */}
      <div className="md:col-span-8 space-y-10">
        <div className="flex justify-end items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <span>ORDENAR POR:</span>
          <select className="border border-gray-100 bg-white text-black p-2 rounded-none outline-none">
            <option>Mais Recentes</option>
            <option>Maior Nota</option>
          </select>
        </div>

        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-8 border border-gray-50 shadow-sm space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#E5B343" color="#E5B343" />)}
            </div>
            <div>
              <span className="font-bold text-[#333] font-serif">{review.author}</span>
              <span className="text-xs text-gray-300 ml-2">{review.date}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-serif italic">
              "{review.content}"
            </p>
            {review.images.length > 0 && (
              <div className="flex gap-2 pt-2">
                {review.images.map((img, idx) => (
                  <img key={idx} src={img} className="w-20 h-24 object-cover border border-gray-100" alt="Review" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};