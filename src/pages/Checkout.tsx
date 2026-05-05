"use client";

import React from 'react';
import { useCheckout, PaymentMethod } from '@/hooks/useCheckout';
import { PersonalInfoSection } from '@/components/checkout/PersonalInfoSection';
import { ShippingAddressSection } from '@/components/checkout/ShippingAddressSection';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { PIXPaymentModal } from '@/components/checkout/PIXPaymentModal';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, QrCode, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { DebugInspector } from '@/components/admin/DebugInspector';
import { IntegrityBanner } from '@/components/admin/IntegrityBanner';
import { cn } from '@/lib/utils';

const Checkout = () => {
  const {
    data,
    updateField,
    loading,
    cart,
    cartTotal,
    paymentMethod,
    setPaymentMethod,
    handleProcessPayment,
    paymentResult,
    showModal,
    setShowModal
  } = useCheckout();

  const methods = [
    { id: 'PIX' as PaymentMethod, label: 'PIX', icon: QrCode },
    { id: 'BOLETO' as PaymentMethod, label: 'Boleto', icon: FileText },
    { id: 'CREDIT_CARD' as PaymentMethod, label: 'Cartão', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <IntegrityBanner />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-12">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <PersonalInfoSection data={data} updateField={updateField} />
            <ShippingAddressSection data={data} updateField={updateField} />
            
            {/* Seção 3: Forma de Pagamento */}
            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#B89C6A] text-white flex items-center justify-center font-bold text-lg">3</div>
                <h2 className="text-xl font-serif font-bold text-gray-900">Forma de Pagamento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={cn(
                      "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all relative overflow-hidden h-32 justify-center",
                      paymentMethod === m.id 
                        ? "bg-black border-black shadow-xl" 
                        : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
                    )}
                  >
                    <m.icon 
                      size={28} 
                      className={cn(
                        "transition-colors",
                        paymentMethod === m.id ? "text-[#B89C6A]" : "text-gray-400"
                      )} 
                    />
                    <span 
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest transition-colors",
                        paymentMethod === m.id ? "text-[#B89C6A]" : "text-gray-500"
                      )}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleProcessPayment}
                disabled={loading || cart.length === 0}
                className="w-full md:w-auto min-w-[300px] h-20 rounded-full bg-black hover:bg-zinc-800 text-white text-lg font-bold uppercase tracking-[0.2em] shadow-2xl shadow-black/10 transition-all active:scale-95 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-8 h-8" />
                ) : (
                  <span className="flex items-center gap-3">
                    Confirmar e Pagar Agora <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>

            <div className="mt-8 flex flex-col items-center md:items-start gap-4">
               <div className="flex items-center gap-2 text-gray-400">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pagamento 100% Seguro & Criptografado</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <CheckoutSummary cart={cart} total={cartTotal} />
          </div>
        </div>

        {paymentResult && (
          <PIXPaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            data={paymentResult}
          />
        )}
      </main>

      <DebugInspector />
    </div>
  );
};

export default Checkout;