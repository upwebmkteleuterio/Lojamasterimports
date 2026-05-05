"use client";

import React from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { PersonalInfoSection } from '@/components/checkout/PersonalInfoSection';
import { ShippingAddressSection } from '@/components/checkout/ShippingAddressSection';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { PIXPaymentModal } from '@/components/checkout/PIXPaymentModal';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { DebugInspector } from '@/components/admin/DebugInspector';
import { IntegrityBanner } from '@/components/admin/IntegrityBanner';

const Checkout = () => {
  const {
    data,
    updateField,
    loading,
    cart,
    cartTotal,
    handleProcessPayment,
    pixData,
    showPIXModal,
    setShowPIXModal
  } = useCheckout();

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <IntegrityBanner />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-12">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Lado Esquerdo: Formulário */}
          <div className="lg:col-span-7 space-y-8">
            <PersonalInfoSection data={data} updateField={updateField} />
            <ShippingAddressSection data={data} updateField={updateField} />
            
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
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 text-center md:text-left">
                Ao clicar, você será direcionado para o pagamento instantâneo via PIX.
              </p>
            </div>
          </div>

          {/* Lado Direito: Resumo */}
          <div className="lg:col-span-5">
            <CheckoutSummary cart={cart} total={cartTotal} />
          </div>
        </div>

        {pixData && (
          <PIXPaymentModal
            isOpen={showPIXModal}
            onClose={() => setShowPIXModal(false)}
            brCode={pixData.brCode}
            brCodeBase64={pixData.brCodeBase64}
            orderId={pixData.orderId}
          />
        )}
      </main>

      <DebugInspector />
    </div>
  );
};

export default Checkout;