import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { formData, orderId, customerData, total } = await req.json()
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')

    console.log("[process-payment] Iniciando processamento forense", { orderId, method: formData.payment_method_id });

    if (!accessToken) {
      console.error("[process-payment] ERRO CRÍTICO: Token de Acesso não configurado no Supabase.");
      throw new Error("Token de Acesso do Mercado Pago ausente nas variáveis de ambiente.");
    }

    // Montando o payload para a API de PAGAMENTOS (Padrão Bricks)
    const paymentPayload = {
      transaction_amount: Number(total),
      token: formData.token,
      description: `Pedido #${orderId.split('-')[0]} - Diamond Store`,
      installments: Number(formData.installments || 1),
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id,
      payer: {
        email: customerData.email,
        identification: {
          type: "CPF",
          number: customerData.cpf.replace(/\D/g, '')
        },
        first_name: customerData.fullName.split(' ')[0],
        last_name: customerData.fullName.split(' ').slice(1).join(' ') || 'Cliente'
      },
      external_reference: orderId,
      notification_url: "https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/mercadopago-webhook"
    };

    console.log("[process-payment] Enviando requisição para Mercado Pago API /v1/payments");

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': orderId
      },
      body: JSON.stringify(paymentPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[process-payment] Mercado Pago retornou erro:", result);
      return new Response(JSON.stringify({ 
        error: "Erro na API do Mercado Pago", 
        details: result,
        status: response.status 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[process-payment] Sucesso! Status do pagamento:", result.status);

    // Atualiza o pedido no banco com os dados reais do MP
    const { error: dbError } = await supabaseClient
      .from('orders')
      .update({
        mp_payment_id: result.id.toString(),
        payment_method: result.payment_method_id,
        payment_status: result.status,
        payment_status_detail: result.status_detail,
        status: mapStatus(result.status),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (dbError) console.error("[process-payment] Erro ao atualizar banco após pagamento:", dbError);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("[process-payment] Erro excepcional:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})

function mapStatus(mpStatus: string) {
  const map: any = {
    'approved': 'Pago',
    'pending': 'Pagamento Pendente',
    'in_process': 'Pagamento Pendente',
    'rejected': 'Cancelado',
    'cancelled': 'Cancelado',
    'refunded': 'Pagamento Estornado'
  };
  return map[mpStatus] || 'Pendente';
}