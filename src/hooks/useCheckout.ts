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
  apartment: '', observations: '',
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

  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Sincroniza cálculo de frete sempre que o CEP estiver completo
  useEffect(() => {
    const cleanCep = data.zipCode.replace(/\D/g, '');
    if (cleanCep.length === 8 && cart.length > 0) {
      const calculateShipping = async () => {
        setLoadingShipping(true);
        setShippingError('');
        setShippingOptions([]);
        setSelectedShippingOption(null);

        try {
          const response = await fetch('https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/frenet-shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientCep: cleanCep,
              items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                promo_price: item.promotionalPrice,
                weight: item.weight || 0.3,
                width: item.width || 15,
                height: item.height || 5,
                length: item.length || 15,
                quantity: item.quantity
              }))
            })
          });

          const resData = await response.json();
          if (!response.ok) throw new Error(resData.error || "Erro ao calcular o frete.");

          setShippingOptions(resData.services || []);
          if (resData.services && resData.services.length > 0) {
            // Seleciona o frete mais barato por padrão
            const cheapest = resData.services.reduce((prev: any, curr: any) => prev.price < curr.price ? prev : curr);
            setSelectedShippingOption(cheapest);
          } else {
            setShippingError("Nenhuma opção de entrega encontrada para este CEP.");
          }
        } catch (err: any) {
          console.error(err);
          setShippingError(err.message || "Erro ao calcular frete.");
        } finally {
          setLoadingShipping(false);
        }
      };

      calculateShipping();
    } else {
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingError('');
    }
  }, [data.zipCode, cart]);

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
        apartment: prev.apartment || '',
        observations: prev.observations || '',
      }));
    }
  }, [profile, setData]);

  const handleProcessPayment = async () => {
    if (!validateCPF(data.cpf)) return toast.error('CPF inválido.');
    if (!data.fullName || !data.phone) return toast.error('Preencha nome e telefone.');
    
    const hasCep = data.zipCode.replace(/\D/g, '').length === 8;
    if (hasCep && shippingOptions.length > 0 && !selectedShippingOption) {
      return toast.error('Selecione uma opção de entrega.');
    }

    setLoading(true);
    const finalTotal = cartTotal + (selectedShippingOption?.price || 0);
    diamondDebug('info', `Iniciando pagamento via ${paymentMethod}...`);
    traceSaveFlow('abacatepay-process-call', { method: paymentMethod, total: finalTotal });

    try {
      const response = await fetch(`https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/abacatepay-process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerData: data,
          total: finalTotal,
          items: cart,
          userId: user?.id,
          method: paymentMethod,
          shippingCost: selectedShippingOption?.price || 0
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha no processamento.');

      // Se for Cartão de Crédito, redirecionamos para a URL de checkout da AbacatePay
      if (paymentMethod === 'CREDIT_CARD' && result.url) {
        diamondDebug('success', 'Redirecionando para checkout seguro...');
        window.location.href = result.url;
        return;
      }

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
    setShowModal,
    shippingOptions,
    selectedShippingOption,
    setSelectedShippingOption,
    loadingShipping,
    shippingError
  };
};