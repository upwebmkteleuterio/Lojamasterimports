import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { validateCPF } from '@/utils/validation';
import { diamondDebug } from '@/utils/debug';
import { traceSaveFlow, checkIntegrity } from '@/utils/integrityDiagnostic';
import { toast } from 'sonner';

const initialCustomerData: CustomerData = {
  fullName: '', email: '', phone: '', cpf: '',
  zipCode: '', address: '', number: '', city: '', state: '',
};

export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export const useCheckout = () => {
  const { cart, cartTotal } = useCart();
  const { user, profile } = useAuth();
  const { data, updateField, setData } = usePersistence<CustomerData>('checkout_form', initialCustomerData);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  
  const [paymentResult, setPaymentResult] = useState<{
    brCode?: string;
    brCodeBase64?: string;
    barCode?: string;
    url?: string;
    orderId: string;
    method: PaymentMethod;
  } | null>(null);
  
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        email: profile.email || '',
        phone: prev.phone || profile.phone || '',
        cpf: prev.cpf || profile.cpf || '',
        zipCode: prev.zipCode || profile.zip_code || '',
        address: prev.address || profile.address || '',
        number: prev.number || profile.number || '',
        city: prev.city || profile.city || '',
        state: prev.state || profile.state || '',
      }));
    }
  }, [profile, setData]);

  const handleProcessPayment = async () => {
    if (!validateCPF(data.cpf)) return toast.error('CPF inválido.');
    if (!data.fullName || !data.phone) return toast.error('Preencha nome e telefone.');

    setLoading(true);
    diamondDebug('info', `Iniciando pagamento via ${paymentMethod}...`);
    traceSaveFlow('abacatepay-process-call', { method: paymentMethod, total: cartTotal });

    try {
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/abacatepay-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData: data,
          total: cartTotal,
          items: cart,
          userId: user?.id,
          method: paymentMethod
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha no processamento.');

      setPaymentResult({
        ...result,
        method: paymentMethod
      });
      setShowModal(true);
      diamondDebug('success', 'Cobrança gerada.', { orderId: result.orderId });

    } catch (error: any) {
      diamondDebug('error', 'Erro no Checkout', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};