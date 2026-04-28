import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { validateCPF, maskPhone, maskCPF } from '@/utils/validation';
import { diamondDebug } from '@/utils/debug';

const initialCustomerData: CustomerData = {
  fullName: '', email: '', phone: '', cpf: '', zipCode: '', address: '', number: '', city: '', state: '',
};

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const { data, updateField } = usePersistence<CustomerData>('checkout_form', initialCustomerData);
  const [loading, setLoading] = useState(false);

  const handleCheckoutPro = async () => {
    if (!validateCPF(data.cpf) || !data.fullName) {
      toast.error('Preencha os dados corretamente.');
      return;
    }

    setLoading(true);
    diamondDebug('info', 'Gerando link de pagamento seguro...');

    try {
      // 1. Criar pedido temporário
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        total: cartTotal,
        customer_data: data,
        items: cart,
        status: 'Pendente'
      }).select().single();

      if (orderError) throw orderError;

      // 2. Chamar Edge Function para obter o Link do Checkout Pro
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerData: data,
          total: cartTotal,
          items: cart
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      diamondDebug('success', 'Link gerado. Redirecionando para área segura do Mercado Pago...');
      
      // 3. Redirecionar o usuário para a tela oficial do Mercado Pago
      window.location.href = result.init_point;

    } catch (error: any) {
      diamondDebug('error', 'FALHA AO GERAR PAGAMENTO', error);
      toast.error('Erro ao conectar com Mercado Pago.');
      setLoading(false);
    }
  };

  return (
    <main className="py-12 max-w-4xl mx-auto px-4">
      <div className="space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-serif font-bold">Finalizar sua Compra</h1>
          <p className="text-gray-400 mt-2">Você será redirecionado para o ambiente seguro do Mercado Pago</p>
        </header>

        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="md:col-span-2 space-y-2"><Label>Nome Completo</Label><Input value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="rounded-2xl h-12" /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input value={data.phone} onChange={(e) => updateField('phone', maskPhone(e.target.value))} className="rounded-2xl h-12" /></div>
            <div className="space-y-2"><Label>CPF</Label><Input value={data.cpf} onChange={(e) => updateField('cpf', maskCPF(e.target.value))} className="rounded-2xl h-12" /></div>
          </div>

          <Button 
            onClick={handleCheckoutPro} 
            disabled={loading || cart.length === 0}
            className="w-full h-16 rounded-full bg-[#B89C6A] hover:bg-black text-white font-bold uppercase tracking-widest shadow-xl transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2"><CreditCard size={20} /> PAGAR AGORA (PIX / CARTÃO / BOLETO)</span>
            )}
          </Button>

          <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
             <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" className="h-4 object-contain" alt="MP" />
             <div className="h-4 w-px bg-gray-300" />
             <ShieldCheck size={16} />
             <span className="text-[10px] font-bold uppercase">Ambiente Criptografado</span>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Checkout;