"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ProductQuestions = () => {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('store_configs').select('support_phone').maybeSingle();
      if (data?.support_phone) {
        // Remove tudo que não for número para o link do WhatsApp
        setPhone(data.support_phone.replace(/\D/g, ''));
      }
    };
    fetchConfig();
  }, []);

  const handleWhatsApp = () => {
    if (phone) {
      window.open(`https://wa.me/${phone}?text=Olá, tenho dúvidas sobre um produto da loja.`, '_blank');
    }
  };

  return (
    <div className="py-20 flex flex-col items-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
        <MessageCircle size={32} />
      </div>
      <h3 className="text-xl font-serif text-gray-800">Possui alguma dúvida sobre este item?</h3>
      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
        Nossa equipe de especialistas Diamond está pronta para te atender e tirar todas as suas dúvidas sobre materiais, tamanhos ou prazos.
      </p>
      <Button 
        onClick={handleWhatsApp}
        className="rounded-none bg-[#25D366] hover:bg-[#128C7E] text-white font-bold tracking-widest px-12 h-14"
      >
        FALE CONOSCO NO WHATSAPP
      </Button>
    </div>
  );
};