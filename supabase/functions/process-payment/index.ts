import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { orderId, customerData, total, items } = await req.json()
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')

    if (!accessToken) throw new Error("Token MP ausente");

    // Criando a Preferência de Pagamento (Checkout Pro)
    // Este método é o mais robusto e lida com Pix/Boleto automaticamente
    const preferencePayload = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'BRL'
      })),
      payer: {
        name: customerData.fullName,
        email: customerData.email,
        identification: { type: "CPF", number: customerData.cpf.replace(/\D/g, '') }
      },
      external_reference: orderId,
      back_urls: {
        success: "https://wild-binturong-sniff.dyad.app/minha-conta",
        failure: "https://wild-binturong-sniff.dyad.app/checkout",
        pending: "https://wild-binturong-sniff.dyad.app/minha-conta"
      },
      auto_return: "approved",
      notification_url: "https://esdhiurlyicjopjlxvba.supabase.co/functions/v1/mercadopago-webhook"
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencePayload)
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Erro MP", details: result }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Retorna o link de pagamento (init_point)
    return new Response(JSON.stringify({ 
      id: result.id, 
      init_point: result.sandbox_init_point // Usa sandbox para testes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})