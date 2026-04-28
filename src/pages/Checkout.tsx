import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { limparDadosFormulario } from '@/services/persistence';
import { toast } from 'sonner';
import { Loader2, CreditCard, QrCode, FileText, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { getSafeProductImage } from '@/utils/imageHandler';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { validateCPF, maskPhone, maskCEP, maskCPF, BRAZILIAN_STATES } from '@/utils/validation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { diamondDebug } from '@/utils/debug';
import { cn } from '@/lib/utils';

const MP_PUBLIC_KEY = "TEST-a9cf1b2c-6fc9-471a-bef4-172ea70d9a2f";

const initialCustomerData: CustomerData = {
  fullName: '', email: '', phone: '', cpf: '', zipCode: '', address: '', number: '', city: '', state: '',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { data, updateField, setData } = usePersistence<CustomerData>('checkout_form', initialCustomerData);
  
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('pix');
  
  // Script do Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => diamondDebug('success', 'SDK Mercado Pago Carregado (v2)');
    document.body.appendChild(script);

    if (profile) {
      setData({
        fullName: data.fullName || profile.full_name || '',
        email: user?.email || '',
        phone: data.phone || maskPhone(profile.phone || ''),
        cpf: data.cpf || maskCPF(profile.cpf || ''),
        zipCode: data.zipCode || maskCEP(profile.zip_code || ''),
        address: data.address || profile.address || '',
        number: data.number || profile.number || '',
        city: data.city || profile.city || '',
        state: data.state || profile.state || '',
      });
    }
  }, [profile, user]);

  const createInitialOrder = async () => {
    if (!validateCPF(data.cpf)) {
      toast.error('CPF inválido.');
      return;
    }
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        total: cartTotal,
        customer_data: data,
        items: cart,
        status: 'Pendente'
      }).select().single();

      if (error) throw error;
      setOrderCreated(order.id);
      diamondDebug('success', 'Pedido gerado no banco. Prosseguindo para pagamento manual.', { id: order.id });
    } catch (e: any) {
      toast.error('Erro ao salvar dados de entrega.');
      diamondDebug('error', 'Falha ao criar order', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPayment = async () => {
    setLoading(true);
    diamondDebug('info', `Iniciando processamento: ${paymentMethod}`);

    // Mapeamento manual de IDs para evitar o erro 422
    const methodMapping = {
      pix: { id: 'pix', type: 'bank_transfer' },
      boleto: { id: 'bolbradesco', type: 'ticket' }, // Explicitamente bolbradesco para Sandbox
      credit_card: { id: 'visa', type: 'credit_card' } // Mock inicial para teste
    };

    const selected = methodMapping[paymentMethod];

    try {
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          formData: {
            payment_method_id: selected.id,
            payment_type_id: selected.type,
            installments: 1,
            token: null // Para Pix/Boleto é null
          },
          orderId: orderCreated,
          customerData: data,
          total: cartTotal
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro no processamento da API');

      diamondDebug('success', 'PAGAMENTO PROCESSADO COM SUCESSO', result);
      toast.success('Pedido finalizado com sucesso!');
      clearCart();
      limparDadosFormulario('checkout_form');
      navigate('/minha-conta');
    } catch (error: any) {
      diamondDebug('error', 'FALHA NA PONTE DE PAGAMENTO', error);
      toast.error(error.message || 'Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <header>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">Finalizar Compra</h1>
            <p className="text-gray-400 mt-2 text-sm">Ambiente seguro e criptografado</p>
          </header>
          
          <div className="space-y-6">
            {/* ETAPA 1: ENTREGA */}
            <section className={cn("bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 transition-all", orderCreated && "opacity-50")}>
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                Dados de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2"><Label className="ml-4 text-[10px] font-black uppercase text-gray-400">Nome Completo</Label><Input value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-14 bg-gray-50 border-gray-100" /></div>
                <div className="space-y-2"><Label className="ml-4 text-[10px] font-black uppercase text-gray-400">WhatsApp</Label><Input value={data.phone} onChange={(e) => updateField('phone', maskPhone(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-14 bg-gray-50 border-gray-100" /></div>
                <div className="space-y-2"><Label className="ml-4 text-[10px] font-black uppercase text-gray-400">CPF</Label><Input value={data.cpf} onChange={(e) => updateField('cpf', maskCPF(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-14 bg-gray-50 border-gray-100" /></div>
                <div className="space-y-2"><Label className="ml-4 text-[10px] font-black uppercase text-gray-400">CEP</Label><Input value={data.zipCode} onChange={(e) => updateField('zipCode', maskCEP(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-14 bg-gray-50 border-gray-100" /></div>
                <div className="space-y-2"><Label className="ml-4 text-[10px] font-black uppercase text-gray-400">Cidade</Label><Input value={data.city} onChange={(e) => updateField('city', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-14 bg-gray-50 border-gray-100" /></div>
              </div>
              {!orderCreated && (
                <Button onClick={createInitialOrder} disabled={loading} className="w-full h-16 mt-10 rounded-full bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs shadow-xl">
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar e Continuar'}
                </Button>
              )}
            </section>

            {/* ETAPA 2: PAGAMENTO */}
            {orderCreated && (
              <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl border-2 border-[#B89C6A]/20 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm font-bold">2</span>
                  Forma de Pagamento
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group", paymentMethod === 'pix' ? "border-[#B89C6A] bg-[#B89C6A]/5" : "border-gray-50 hover:border-gray-200")}
                  >
                    <QrCode size={32} className={cn("mb-2", paymentMethod === 'pix' ? "text-[#B89C6A]" : "text-gray-300")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">PIX</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('boleto')}
                    className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group", paymentMethod === 'boleto' ? "border-[#B89C6A] bg-[#B89C6A]/5" : "border-gray-50 hover:border-gray-200")}
                  >
                    <FileText size={32} className={cn("mb-2", paymentMethod === 'boleto' ? "text-[#B89C6A]" : "text-gray-300")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">BOLETO</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('credit_card')}
                    className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group", paymentMethod === 'credit_card' ? "border-[#B89C6A] bg-[#B89C6A]/5" : "border-gray-50 hover:border-gray-200")}
                  >
                    <CreditCard size={32} className={cn("mb-2", paymentMethod === 'credit_card' ? "text-[#B89C6A]" : "text-gray-300")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">CARTÃO</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 mb-8 border border-gray-100">
                  {paymentMethod === 'pix' && (
                    <div className="text-center space-y-3">
                      <p className="font-bold text-gray-800">Pagamento Instantâneo</p>
                      <p className="text-xs text-gray-500 leading-relaxed">O código Pix e o QR Code serão gerados imediatamente após você clicar no botão finalizar abaixo.</p>
                    </div>
                  )}
                  {paymentMethod === 'boleto' && (
                    <div className="text-center space-y-3">
                      <p className="font-bold text-gray-800">Boleto Bancário</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Você receberá o link para o boleto. A confirmação ocorre em até 24h úteis após o pagamento.</p>
                    </div>
                  )}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4">
                      <p className="font-bold text-gray-800 text-center">Cartão de Crédito</p>
                      <div className="space-y-3 opacity-40 pointer-events-none">
                         <Input placeholder="Número do Cartão" className="h-12 rounded-xl" />
                         <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Validade" className="h-12 rounded-xl" />
                            <Input placeholder="CVV" className="h-12 rounded-xl" />
                         </div>
                      </div>
                      <p className="text-[9px] text-amber-600 font-bold uppercase text-center">Nota: Utilize Pix ou Boleto para validar a integração Sandbox.</p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleFinalPayment} 
                  disabled={loading}
                  className="w-full h-16 rounded-full bg-[#B89C6A] hover:bg-black text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#B89C6A]/30 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : `FINALIZAR COM ${paymentMethod.toUpperCase()}`}
                </Button>

                <button onClick={() => setOrderCreated(null)} className="w-full mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Voltar e alterar endereço</button>
              </section>
            )}
          </div>
        </div>

        {/* RESUMO LATERAL */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-gray-400">Seu Pedido</h2>
            <div className="space-y-6 mb-10">
               {cart.map(item => (
                 <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                       <img src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                       <p className="text-[10px] text-gray-400 font-medium mt-1">{item.quantity} un. x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="border-t border-dashed border-gray-200 pt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400 font-medium">Subtotal</span>
                 <span className="font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-400 font-medium">Frete</span>
                 <span className="text-green-600 font-black uppercase text-[10px]">Grátis</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                 <span className="text-lg font-serif font-bold text-gray-900">Total</span>
                 <span className="text-3xl font-black text-[#B89C6A]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
               <ShieldCheck className="text-[#B89C6A]" size={20} />
               <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">Sua transação é protegida pela tecnologia de criptografia do Mercado Pago.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;