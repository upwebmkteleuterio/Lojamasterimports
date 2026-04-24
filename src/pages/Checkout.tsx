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
import { Truck, Tag, Loader2, CreditCard, QrCode, FileText } from 'lucide-react';
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

// Chave Pública fornecida pelo usuário
const MP_PUBLIC_KEY = "TEST-a9cf1b2c-6fc9-471a-bef4-172ea70d9a2f";

initMercadoPago(MP_PUBLIC_KEY, {
  locale: 'pt-BR'
});

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
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return false;
    }
    if (!validateCPF(data.cpf)) {
      toast.error('Por favor, informe um CPF válido.');
      return false;
    }
    return true;
  };

  const createInitialOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (user) {
        await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            phone: data.phone,
            cpf: data.cpf,
            zip_code: data.zipCode,
            address: data.address,
            number: data.number,
            city: data.city,
            state: data.state,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          total: cartTotal + shippingCost,
          shipping_cost: shippingCost,
          status: 'Pendente',
          customer_data: data,
          items: cart,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      setOrderCreated(orderData.id);
      toast.success('Informações salvas. Escolha a forma de pagamento.');
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao processar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async ({ formData }: any) => {
    if (!orderCreated) return;

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

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      clearCart();
      limparDadosFormulario('checkout_form');
      toast.success('Pedido finalizado com sucesso!');
      navigate('/minha-conta');
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast.error(error.message || 'Erro ao processar o pagamento. Tente novamente.');
    }
  };

  return (
    <main className="py-12">
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
                  <Input 
                    id="fullName" 
                    value={data.fullName} 
                    onChange={(e) => updateField('fullName', e.target.value)} 
                    required 
                    disabled={!!orderCreated}
                    className="rounded-2xl h-12 bg-gray-50 border-gray-100" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => updateField('email', e.target.value)} disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input id="phone" value={data.phone} onChange={(e) => updateField('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={data.cpf} onChange={(e) => updateField('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">2</span>
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input id="zipCode" value={data.zipCode} onChange={(e) => updateField('zipCode', maskCEP(e.target.value))} placeholder="00000-000" required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" value={data.address} onChange={(e) => updateField('address', e.target.value)} required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" value={data.number} onChange={(e) => updateField('number', e.target.value)} required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={data.city} onChange={(e) => updateField('city', e.target.value)} required disabled={!!orderCreated} className="rounded-2xl h-12 bg-gray-50 border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={data.state} onValueChange={(val) => updateField('state', val)} disabled={!!orderCreated}>
                    <SelectTrigger className="rounded-2xl h-12 bg-gray-50 border-gray-100">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {BRAZILIAN_STATES.map((st) => (
                        <SelectItem key={st.value} value={st.value}>{st.label} ({st.value})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {!orderCreated && (
                <Button 
                  onClick={createInitialOrder} 
                  disabled={loading} 
                  className="w-full h-14 mt-8 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-all gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Dados e Ir para Pagamento'}
                </Button>
              )}
            </section>

            {orderCreated && (
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#B89C6A] text-white flex items-center justify-center text-sm">3</span>
                  Forma de Pagamento
                </h2>
                
                <div id="payment-brick-container">
                  <Payment
                    initialization={{
                      amount: cartTotal + shippingCost,
                    }}
                    customization={{
                      paymentMethods: {
                        creditCard: 'all',
                        debitCard: 'all',
                        bankTransfer: ['pix'],
                        ticket: ['boleto'],
                      },
                      visual: {
                        style: {
                          theme: 'default',
                        }
                      }
                    }}
                    onSubmit={handlePaymentSubmit}
                    onReady={() => {
                      console.log('Payment Brick ready');
                    }}
                    onError={(error) => {
                      console.error('Payment Brick error:', error);
                    }}
                  />
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setOrderCreated(null)} 
                  className="w-full mt-4 text-gray-400 text-xs hover:text-gray-600"
                >
                  Alterar dados de entrega
                </Button>
              </section>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Resumo da Compra</h2>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 mb-8 scrollbar-hide">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-50">
                    <img src={getSafeProductImage(item.selectedVariant?.main_image || item.image)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    {item.selectedVariant && (
                      <p className="text-[10px] text-[#B89C6A] font-bold uppercase mt-1 flex items-center gap-1">
                        <Tag size={10} /> {item.selectedVariant.option_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{item.quantity} unidade(s)</p>
                  </div>
                  <p className="font-bold text-sm py-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-6 border-t border-dashed">
              <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                <span>Frete</span>
                <span className="text-green-600">Grátis</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-gray-50">
                <span className="text-gray-400 font-serif">Total</span>
                <span className="text-3xl text-[#B89C6A]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
              </div>
              
              <div className="pt-6">
                <div className="flex flex-col items-center p-4 rounded-3xl border border-gray-50 bg-gray-50/50">
                  <Truck size={20} className="text-[#B89C6A] mb-2" />
                  <span className="text-[10px] uppercase font-bold text-gray-400">Entrega</span>
                  <span className="text-xs font-bold text-green-600">Grátis para todo Brasil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;