import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, Clock, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PaymentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    brCode?: string;
    brCodeBase64?: string;
    barCode?: string;
    url?: string;
    orderId: string;
    method: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  };
}

export const PIXPaymentModal = ({ isOpen, onClose, data }: PaymentResultModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!data.orderId || !isOpen) return;

    const channel = supabase
      .channel(`order-status-${data.orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${data.orderId}` }, 
      (payload) => {
        if (payload.new.status === 'Pago') {
          setIsPaid(true);
          setTimeout(() => { onClose(); navigate('/minha-conta'); }, 3000);
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [data.orderId, isOpen, navigate, onClose]);

  const qrCodeSrc = data.brCodeBase64?.startsWith('data:') ? data.brCodeBase64 : `data:image/png;base64,${data.brCodeBase64}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 scrollbar-hide">
        {/* Header Visual */}
        <div className="bg-[#B89C6A] p-8 text-white text-center relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-white uppercase tracking-widest">
              {isPaid ? "Sucesso!" : data.method === 'PIX' ? "Pagamento PIX" : "Seu Boleto"}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium">
              {isPaid ? "Pagamento aprovado." : "Siga as instruções abaixo para concluir."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          {isPaid ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <p className="font-bold text-gray-600 uppercase tracking-widest text-xs">Redirecionando...</p>
            </div>
          ) : (
            <>
              {/* VISUALIZAÇÃO PIX */}
              {data.method === 'PIX' && (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-3xl border-4 border-gray-50">
                    <img src={qrCodeSrc} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="w-full space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4 text-[10px] font-mono text-gray-500 break-all border border-gray-100 relative">
                      {data.brCode}
                      <Button size="icon" variant="ghost" className="absolute right-2 top-2 h-8 w-8" onClick={() => handleCopy(data.brCode!)}>
                        {copied ? <Check size={14}/> : <Copy size={14}/>}
                      </Button>
                    </div>
                    <Button onClick={() => handleCopy(data.brCode!)} className="w-full h-14 rounded-full bg-black text-white font-bold uppercase tracking-widest text-xs">
                      {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                    </Button>
                  </div>
                </div>
              )}

              {/* VISUALIZAÇÃO BOLETO */}
              {data.method === 'BOLETO' && (
                <div className="w-full space-y-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 text-center">
                    <FileText size={40} className="text-[#B89C6A]" />
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase">Linha Digitável</p>
                      <p className="text-[11px] font-mono text-gray-400 mt-1">{data.barCode}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button onClick={() => handleCopy(data.barCode!)} variant="outline" className="h-14 rounded-full border-gray-200 font-bold uppercase text-[10px] tracking-widest">
                       <Copy size={14} className="mr-2" /> Copiar Código de Barras
                    </Button>
                    <Button onClick={() => window.open(data.url, '_blank')} className="h-14 rounded-full bg-black text-white font-bold uppercase text-[10px] tracking-widest">
                       <ExternalLink size={14} className="mr-2" /> Abrir Boleto para Impressão
                    </Button>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[9px] text-amber-700 font-bold uppercase text-center leading-relaxed">
                      O boleto pode levar até 30 minutos para ser registrado no seu banco.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 w-full text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Pagamento Seguro & Criptografado</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};