import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, Clock, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PIXPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  brCode: string;
  brCodeBase64: string;
  orderId: string;
}

export const PIXPaymentModal = ({
  isOpen,
  onClose,
  brCode,
  brCodeBase64,
  orderId
}: PIXPaymentModalProps) => {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  // Garante que o src da imagem esteja correto (evita duplicidade de prefixo data:image)
  const qrCodeSrc = brCodeBase64?.startsWith('data:') 
    ? brCodeBase64 
    : `data:image/png;base64,${brCodeBase64}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(brCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new.status === 'Pago') {
            setIsPaid(true);
            toast.success("Pagamento confirmado!");
            setTimeout(() => {
              onClose();
              navigate('/minha-conta');
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, isOpen, navigate, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-[40px] border-none shadow-2xl p-0 scrollbar-hide">
        <div className="bg-[#B89C6A] p-8 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-white uppercase tracking-widest">
              {isPaid ? "Sucesso!" : "Pagamento PIX"}
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium">
              {isPaid 
                ? "Seu pagamento foi aprovado."
                : "Escaneie o código abaixo no app do seu banco."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center gap-8">
          {isPaid ? (
            <div className="flex flex-col items-center gap-6 py-10 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                Aguarde... Redirecionando para seus pedidos
              </p>
            </div>
          ) : (
            <>
              {brCodeBase64 && (
                <div className="bg-white p-6 rounded-[32px] shadow-sm border-4 border-gray-50">
                  <img 
                    src={qrCodeSrc} 
                    alt="QR Code PIX"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              )}

              <div className="w-full space-y-6">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest px-2">
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-[#B89C6A]" /> Expira em 30 min
                  </span>
                  <span className="flex items-center gap-2">
                    <QrCode size={14} className="text-[#B89C6A]" /> PIX Copia e Cola
                  </span>
                </div>

                <div className="relative">
                  <div className="bg-gray-50 rounded-2xl p-5 pr-14 text-[11px] font-mono text-gray-500 break-all border border-gray-100 leading-relaxed">
                    {brCode}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-white text-[#B89C6A]"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </Button>
                </div>

                <Button 
                  onClick={handleCopy}
                  className="w-full h-16 rounded-full bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-[0.2em] text-xs shadow-xl transition-all active:scale-95"
                >
                  {copied ? "CÓDIGO COPIADO!" : "COPIAR CÓDIGO PIX"}
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-50 w-full text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">
                  Transação protegida por criptografia de ponta
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};