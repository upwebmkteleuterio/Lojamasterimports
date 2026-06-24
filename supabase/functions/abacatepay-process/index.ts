import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { customerData, total, items, userId, method = "PIX", shippingCost = 0 } = await req.json()
    const apiKey = Deno.env.get('ABACATE_API_KEY')
    const origin = req.headers.get('origin') || "https://wild-binturong-sniff.dyad.app";

    // 1. Criar pedido no Supabase
    const { data: order, error: orderError } = await supabaseClient.from('orders').insert({
      user_id: userId || null,
      total: total,
      customer_data: customerData,
      items: items,
      status: 'Pendente',
      payment_method: method,
      shipping_cost: shippingCost
    }).select().single()

    if (orderError) throw orderError;

    // ==========================================
    // FLUXO 1: CARTÃO DE CRÉDITO (Redirecionamento)
    // ==========================================
    if (method === 'CREDIT_CARD') {
      const abacateItems = [];
      
      // Criar cada produto na AbacatePay antes de gerar o checkout
      for (const item of items) {
         const prodPayload = {
            externalId: String(item.variant_id || item.product_id || item.id), 
            name: String(item.name).substring(0, 100), 
            price: Math.round(item.price * 100), 
            currency: "BRL"
         };
         
         const prodRes = await fetch('https://api.abacatepay.com/v2/products/create', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(prodPayload)
         });
         
         const prodData = await prodRes.json();
         
         if (!prodRes.ok || !prodData.success) {
            console.error("[abacatepay-process] Erro ao criar produto AbacatePay", prodData);
            throw new Error(`Falha ao registrar produto no gateway de pagamento.`);
         }
         
         abacateItems.push({
            id: prodData.data.id,
            quantity: item.quantity
         });
      }

      // Adicionar Frete como um item extra (caso exista e não seja grátis)
      if (shippingCost > 0) {
        const freightPayload = {
          externalId: `freight_${order.id}`,
          name: "Custo de Envio",
          price: Math.round(shippingCost * 100),
          currency: "BRL"
        };
        const freightRes = await fetch('https://api.abacatepay.com/v2/products/create', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(freightPayload)
        });
        const freightData = await freightRes.json();
        if (freightRes.ok && freightData.success) {
          abacateItems.push({ id: freightData.data.id, quantity: 1 });
        }
      }

      // Gerar a URL do Checkout de Cartão
      const checkoutPayload = {
        methods: ["CARD"],
        externalId: order.id,
        returnUrl: `${origin}/minha-conta`,
        completionUrl: `${origin}/minha-conta`,
        items: abacateItems,
        card: { maxInstallments: 12 }
      }

      const response = await fetch('https://api.abacatepay.com/v2/checkouts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutPayload)
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        console.error("[abacatepay-process] Erro Checkout Cartão", result);
        return new Response(JSON.stringify({ error: "Erro Cartão", details: result }), { status: 400, headers: corsHeaders })
      }

      return new Response(JSON.stringify({ 
        orderId: order.id,
        url: result.data.url 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // ==========================================
    // FLUXO 2: PIX e BOLETO (Transparente)
    // ==========================================
    const abacatePayload = {
      method: method, 
      data: {
        amount: Math.round(total * 100),
        description: `Pedido #${order.id.split('-')[0]}`,
        externalId: order.id,
        customer: {
          name: customerData.fullName,
          email: customerData.email,
          taxId: customerData.cpf, // <-- MANTÉM A MÁSCARA AQUI PARA A ABACATEPAY ACEITAR (XXX.XXX.XXX-XX)
          cellphone: customerData.phone // <-- MANTÉM A MÁSCARA AQUI ((XX) XXXXX-XXXX)
        }
      }
    }

    const response = await fetch('https://api.abacatepay.com/v2/transparents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(abacatePayload)
    })

    const result = await response.json()
    if (!response.ok || !result.success) {
      console.error("[abacatepay-process] Erro Transparente", result);
      return new Response(JSON.stringify({ error: "Erro API Abacate", details: result }), { status: 400, headers: corsHeaders })
    }

    const resData = result.data;

    return new Response(JSON.stringify({ 
      orderId: order.id,
      brCode: resData.brCode,
      brCodeBase64: resData.brCodeBase64,
      barCode: resData.barCode,
      url: resData.url,
      expiresAt: resData.expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})