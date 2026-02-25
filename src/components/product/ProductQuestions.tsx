"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export const ProductQuestions = () => {
  return (
    <div className="py-20 flex flex-col items-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
        <MessageCircle size={32} />
      </div>
      <h3 className="text-xl font-serif text-gray-800">Possui alguma dúvida sobre este item?</h3>
      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
        Nossa equipe de especialistas Diamond está pronta para te atender e tirar todas as suas dúvidas sobre materiais, tamanhos ou prazos.
      </p>
      <Button className="rounded-none bg-[#25D366] hover:bg-[#128C7E] text-white font-bold tracking-widest px-12 h-14">
        FALE CONOSCO NO WHATSAPP
      </Button>
    </div>
  );
};