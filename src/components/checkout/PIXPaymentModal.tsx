import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, QrCode, Clock, CheckCircle2 } from "lucide-react";
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

  const handleCopy = () => {
    navigator.clipboard.writeText(brCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!orderId || !isOpen) return;

    // Monitorar status do pedido via Realtime
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
          console.log('Status do pedido atualizado:', payload.new.status);
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
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-[#B89C6A] p-6 text-white text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-white">
              {isPaid ? "Pagamento Confirmado!" : "Quase lá! Pague com PIX"}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {isPaid 
                ? "Seu pedido foi processado com sucesso."
                : "Escaneie o QR Code ou copie o código abaixo para finalizar."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center gap-6">
          {isPaid ? (
            <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-center text-gray-600 font-medium">
                Redirecionando para seus pedidos...
              </p>
            </div>
          ) : (
            <>
              {brCodeBase64 && (
                <div className="bg-white p-4 rounded-3xl shadow-inner border border-gray-100">
                  <img 
                    src={`data:image/png;base64,${brCodeBase64}`} 
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
              )}

              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-2">
                    <Clock size={16} /> Expira em 30 minutos
                  </span>
                  <span className="flex items-center gap-2">
                    <QrCode size={16} /> PIX Copia e Cola
                  </span>
                </div>

                <div className="relative group">
                  <div className="bg-gray-50 rounded-2xl p-4 pr-12 text-xs font-mono text-gray-600 break-all border border-gray-100 group-hover:border-[#B89C6A] transition-colors">
                    {brCode}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white text-[#B89C6A]"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </Button>
                </div>

                <Button 
                  onClick={handleCopy}
                  className="w-full h-14 rounded-full bg-[#B89C6A] hover:bg-black text-white font-bold uppercase tracking-widest transition-all"
                >
                  {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  Pagamento Seguro via
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-black tracking-tight text-[#B89C6A]">
                    Abacate<span className="text-black">Pay</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
