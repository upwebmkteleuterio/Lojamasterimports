import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { validateCPF, maskPhone, maskCPF } from '@/utils/validation';
import { diamondDebug } from '@/utils/debug';
import { PIXPaymentModal } from '@/components/checkout/PIXPaymentModal';

const initialCustomerData: CustomerData = {
  fullName: '', 
  email: '', 
  phone: '', 
  cpf: '', 
  zipCode: '', 
  address: '', 
  number: '', 
  city: '', 
  state: '',
};

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const { data, updateField } = usePersistence<CustomerData>('checkout_form', initialCustomerData);
  const [loading, setLoading] = useState(false);
  
  // Estados para o Modal de PIX
  const [showPIXModal, setShowPIXModal] = useState(false);
  const [pixData, setPixData] = useState<{
    brCode: string;
    brCodeBase64: string;
    orderId: string;
  } | null>(null);

  const handleAbacatePay = async () => {
    // Validação básica
    if (!validateCPF(data.cpf)) {
      toast.error('CPF inválido.');
      return;
    }
    if (!data.fullName || !data.phone) {
      toast.error('Preencha seu nome e WhatsApp.');
      return;
    }
    if (!data.email || !data.email.includes('@')) {
      toast.error('E-mail inválido.');
      return;
    }

    setLoading(true);
    diamondDebug('info', 'Processando pagamento via AbacatePay...');

    try {
      // Chamar Edge Function para obter os dados do PIX
      // O pedido é criado dentro da Edge Function para garantir atomicidade
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/abacatepay-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData: data,
          total: cartTotal,
          items: cart,
          userId: user?.id
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento.');
      }

      diamondDebug('success', 'Dados do PIX gerados com sucesso.');
      
      // Abrir o modal com o QR Code
      setPixData({
        brCode: result.brCode,
        brCodeBase64: result.brCodeBase64,
        orderId: result.orderId
      });
      setShowPIXModal(true);

    } catch (error: any) {
      diamondDebug('error', 'FALHA AO GERAR PAGAMENTO PIX', error);
      toast.error(error.message || 'Erro ao conectar com AbacatePay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-12 max-w-4xl mx-auto px-4 min-h-[80vh]">
      <div className="space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-500 font-medium">Checkout Transparente e Seguro</p>
        </header>

        <section className="bg-white p-8 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-600 font-bold ml-1">Nome Completo</Label>
              <Input 
                placeholder="Seu nome completo"
                value={data.fullName} 
                onChange={(e) => updateField('fullName', e.target.value)} 
                className="rounded-[20px] h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#B89C6A]/20 transition-all" 
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-600 font-bold ml-1">E-mail</Label>
              <Input 
                type="email"
                placeholder="seu@email.com"
                value={data.email} 
                onChange={(e) => updateField('email', e.target.value)} 
                className="rounded-[20px] h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#B89C6A]/20 transition-all" 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600 font-bold ml-1">WhatsApp</Label>
              <Input 
                placeholder="(00) 00000-0000"
                value={data.phone} 
                onChange={(e) => updateField('phone', maskPhone(e.target.value))} 
                className="rounded-[20px] h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#B89C6A]/20 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 font-bold ml-1">CPF</Label>
              <Input 
                placeholder="000.000.000-00"
                value={data.cpf} 
                onChange={(e) => updateField('cpf', maskCPF(e.target.value))} 
                className="rounded-[20px] h-14 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#B89C6A]/20 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#B89C6A] rounded-full flex items-center justify-center text-white">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total a pagar</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  PIX Instantâneo
                </span>
              </div>
            </div>

            <Button 
              onClick={handleAbacatePay} 
              disabled={loading || cart.length === 0}
              className="w-full h-20 rounded-full bg-[#B89C6A] hover:bg-black text-white text-lg font-black uppercase tracking-[0.2em] shadow-xl shadow-[#B89C6A]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] group"
            >
              {loading ? (
                <Loader2 className="animate-spin w-8 h-8" />
              ) : (
                <span className="flex items-center gap-3">
                  PAGAR COM PIX <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck size={18} className="text-green-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Pagamento 100% Seguro</span>
             </div>
             <div className="flex items-center gap-3 grayscale opacity-60">
                <span className="text-sm font-black text-gray-400">ABACATE<span className="text-black">PAY</span></span>
                <div className="h-4 w-px bg-gray-300" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Powered by Transparency</span>
             </div>
          </div>
        </section>
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
  );
};

export default Checkout;
