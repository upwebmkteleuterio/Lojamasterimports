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
    return validateCPF(data.cpf);
  };

  const createInitialOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    diamondDebug('info', 'Iniciando criação de pedido inicial no checkout.');

    try {
      const payload = {
        user_id: user?.id || null,
        total: cartTotal + shippingCost,
        shipping_cost: shippingCost,
        status: 'Pendente',
        customer_data: data,
        items: cart,
      };

      traceSaveFlow('orders', payload);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (orderError) throw orderError;
      
      setOrderCreated(orderData.id);
      diamondDebug('success', `Pedido criado com ID: ${orderData.id}`);
      
      // Validação de integridade imediata
      checkIntegrity('orders', orderData.id, payload);
      
      toast.success('Dados salvos! Escolha o pagamento.');
    } catch (error: any) {
      diamondDebug('error', 'Falha ao criar pedido no banco', error);
      toast.error('Erro ao processar pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async ({ formData }: any) => {
    if (!orderCreated) return;
    diamondDebug('info', 'Enviando payload para processamento de pagamento via Edge Function.', { formData });

    try {
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          formData,
          orderId: orderCreated,
          customerData: data,
          cart,
          total: cartTotal + shippingCost
        })
      });

      const result = await response.json();
      diamondDebug('info', 'Resposta da Edge Function recebida', result);

      if (!response.ok) throw new Error(result.error || 'Erro no pagamento');

      diamondDebug('success', 'Pagamento processado com sucesso!');
      clearCart();
      limparDadosFormulario('checkout_form');
      navigate('/minha-conta');
      
    } catch (error: any) {
      diamondDebug('error', 'Falha crítica no processamento de pagamento', error);
      toast.error('Erro ao processar o pagamento.');
    }
  };

  return (
    <main className="py-12">
      {orderCreated && (
        <IntegrityBanner 
          entityId={orderCreated} 
          tableName="orders" 
          uiCount={orderCreated ? 1 : 0} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <h1 className="text-3xl font-serif font-bold">Finalizar Compra</h1>
          
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">1</span>
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input id="fullName" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => updateField('email', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" value={data.phone} onChange={(e) => updateField('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={data.cpf} onChange={(e) => updateField('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">2</span>
                Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input id="zipCode" value={data.zipCode} onChange={(e) => updateField('zipCode', maskCEP(e.target.value))} placeholder="CEP" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                <Input id="address" value={data.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Endereço" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 md:col-span-2" />
                <Input id="number" value={data.number} onChange={(e) => updateField('number', e.target.value)} placeholder="Nº" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                <Input id="city" value={data.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Cidade" disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50" />
                <Select value={data.state} onValueChange={(val) => updateField('state', val)} disabled={!!orderCreated}>
                  <SelectTrigger className="rounded-2xl h-12 bg-gray-50"><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">{BRAZILIAN_STATES.map((st) => <SelectItem key={st.value} value={st.value}>{st.value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              
              {!orderCreated && (
                <Button onClick={createInitialOrder} disabled={loading} className="w-full h-14 mt-8 rounded-full bg-black text-white font-bold gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar e Ir para Pagamento'}
                </Button>
              )}
            </section>

            {orderCreated && (
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">3</span>
                  Pagamento
                </h2>
                <Payment
                  initialization={{ amount: cartTotal + shippingCost }}
                  customization={{
                    paymentMethods: { creditCard: 'all', debitCard: 'all', bankTransfer: ['pix'], ticket: ['boleto'] },
                    visual: { style: { theme: 'default' } }
                  }}
                  onSubmit={handlePaymentSubmit}
                />
              </section>
            )}
          </div>
        </div>

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