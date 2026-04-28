import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { limparDadosFormulario } from '@/services/persistence';
import { toast } from 'sonner';
import { Truck, Tag, Loader2 } from 'lucide-react';
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
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { diamondDebug } from '@/utils/debug';
import { traceSaveFlow, checkIntegrity } from '@/utils/integrityDiagnostic';
import { IntegrityBanner } from '@/components/admin/product-form/IntegrityBanner';

const MP_PUBLIC_KEY = "TEST-a9cf1b2c-6fc9-471a-bef4-172ea70d9a2f";

initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });

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
  const [shippingCost] = useState(0);

  useEffect(() => {
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

  const validateForm = () => {
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio');
      return false;
    }
    if (!data.fullName || !data.email || !data.phone || !data.cpf || !data.zipCode || !data.address || !data.number || !data.city || !data.state) {
      toast.error('Preencha todos os campos obrigatórios.');
      return false;
    }
    const isValidCpf = validateCPF(data.cpf);
    if (!isValidCpf) toast.error('CPF inválido.');
    return isValidCpf;
  };

  const createInitialOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    diamondDebug('info', 'PASSO 1: Criando pedido no banco de dados...');

    try {
      const payload = {
        user_id: user?.id || null,
        total: cartTotal + shippingCost,
        shipping_cost: shippingCost,
        status: 'Pendente',
        customer_data: data,
        items: cart,
      };

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (orderError) throw orderError;
      
      setOrderCreated(orderData.id);
      diamondDebug('success', `PASSO 1 OK: Pedido gerado ID ${orderData.id}`);
      checkIntegrity('orders', orderData.id, payload);
    } catch (error: any) {
      diamondDebug('error', 'FALHA NO PASSO 1: Banco recusou o pedido', error);
      toast.error('Erro ao salvar pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async ({ formData }: any) => {
    if (!orderCreated) {
      diamondDebug('error', 'FALHA NO PASSO 2: handlePaymentSubmit chamado sem ID de pedido.');
      return;
    }

    diamondDebug('info', 'PASSO 2: Enviando Token do Cartão para o Backend (Edge Function)...', { 
      orderId: orderCreated,
      paymentMethod: formData.payment_method_id,
      installments: formData.installments
    });

    try {
      // Usando a URL absoluta conforme instrução do sistema
      const functionUrl = `https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/process-payment`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          formData,
          orderId: orderCreated,
          customerData: data,
          total: cartTotal + shippingCost
        })
      });

      const result = await response.json();

      if (!response.ok) {
        diamondDebug('error', 'PASSO 2 FALHOU: Backend retornou erro', result);
        throw new Error(result.error || 'Erro no processamento');
      }

      diamondDebug('success', 'PASSO 2 OK: Pagamento aprovado pelo Mercado Pago!', result);
      
      toast.success('Pagamento processado!');
      clearCart();
      limparDadosFormulario('checkout_form');
      navigate('/minha-conta');
      
    } catch (error: any) {
      diamondDebug('error', 'ERRO CRÍTICO NA PONTE DE PAGAMENTO', {
        mensagem: error.message,
        instancia: error
      });
      toast.error('Ocorreu um erro no pagamento. Verifique o Monitor ADM.');
    }
  };

  return (
    <main className="py-12">
      {orderCreated && (
        <IntegrityBanner 
          entityId={orderCreated} 
          tableName="orders" 
          uiCount={1} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <h1 className="text-3xl font-serif font-bold">Finalizar Compra</h1>
          
          <div className="space-y-6">
            {/* ETAPA 1 E 2: DADOS PESSOAIS E ENTREGA */}
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">1</span>
                Seus Dados e Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2"><Label>Nome Completo</Label><Input value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input value={data.email} onChange={(e) => updateField('email', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2"><Label>WhatsApp</Label><Input value={data.phone} onChange={(e) => updateField('phone', maskPhone(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2"><Label>CPF</Label><Input value={data.cpf} onChange={(e) => updateField('cpf', maskCPF(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2"><Label>CEP</Label><Input value={data.zipCode} onChange={(e) => updateField('zipCode', maskCEP(e.target.value))} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2 md:col-span-1"><Label>Cidade</Label><Input value={data.city} onChange={(e) => updateField('city', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input value={data.address} onChange={(e) => updateField('address', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2"><Label>Número</Label><Input value={data.number} onChange={(e) => updateField('number', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" /></div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={data.state} onValueChange={(val) => updateField('state', val)} disabled={!!orderCreated}>
                    <SelectTrigger className="rounded-2xl h-12 bg-gray-50"><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{BRAZILIAN_STATES.map((st) => <SelectItem key={st.value} value={st.value}>{st.value}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              
              {!orderCreated && (
                <Button onClick={createInitialOrder} disabled={loading} className="w-full h-14 mt-8 rounded-full bg-black text-white font-bold gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar e Ir para Pagamento'}
                </Button>
              )}
            </section>

            {/* ETAPA 3: PAGAMENTO (BRICKS) */}
            {orderCreated && (
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">2</span>
                  Pagamento Seguro
                </h2>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-blue-700 text-xs">
                   <Loader2 size={16} className="animate-spin" />
                   <span>Aguardando preenchimento do formulário do Mercado Pago abaixo...</span>
                </div>
                <Payment
                  initialization={{ amount: cartTotal + shippingCost }}
                  customization={{
                    paymentMethods: { creditCard: 'all', debitCard: 'all', bankTransfer: ['pix'], ticket: ['boleto'] },
                    visual: { style: { theme: 'default' } }
                  }}
                  onSubmit={handlePaymentSubmit}
                />
                <Button variant="ghost" onClick={() => setOrderCreated(null)} className="w-full mt-6 text-gray-400 text-[10px] uppercase font-bold tracking-widest">Alterar dados de entrega</Button>
              </section>
            )}
          </div>
        </div>

        {/* RESUMO LATERAL */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Resumo</h2>
            <div className="space-y-6 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border"><img src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{item.name}</p><p className="text-xs text-gray-500">{item.quantity} un.</p></div>
                  <p className="font-bold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed pt-4 flex justify-between items-center text-lg font-bold">
              <span className="text-gray-400 font-serif">Total</span>
              <span className="text-3xl text-[#B89C6A]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;