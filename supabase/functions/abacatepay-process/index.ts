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

    const { customerData, total, items, userId, method = "PIX" } = await req.json()
    const apiKey = Deno.env.get('ABACATE_API_KEY')

    // 1. Criar pedido no banco
    const { data: order, error: orderError } = await supabaseClient.from('orders').insert({
      user_id: userId || null,
      total: total,
      customer_data: customerData,
      items: items,
      status: 'Pendente',
      payment_method: method
    }).select().single()

    if (orderError) throw orderError;

    // 2. Se for Cartão, usamos o endpoint de Checkout (Redirecionamento)
    if (method === 'CREDIT_CARD') {
      const checkoutPayload = {
        methods: ["CARD"],
        externalId: order.id,
        customerId: userId, // Opcional
        returnUrl: "https://wild-binturong-sniff.dyad.app/minha-conta",
        completionUrl: "https://wild-binturong-sniff.dyad.app/minha-conta",
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: Math.round(item.price * 100) // Centavos
        })),
        card: {
          maxInstallments: 12
        }
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
        return new Response(JSON.stringify({ error: "Erro Cartão", details: result }), { status: 400, headers: corsHeaders })
      }

      return new Response(JSON.stringify({ 
        orderId: order.id,
        url: result.data.url // URL para redirecionar o cliente
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // 3. Se for PIX ou BOLETO, mantemos o Transparent (Mesmo código anterior)
    const abacatePayload = {
      method: method, 
      data: {
        amount: Math.round(total * 100),
        description: `Pedido #${order.id.split('-')[0]}`,
        externalId: order.id,
        customer: {
          name: customerData.fullName,
          email: customerData.email,
          taxId: customerData.cpf.replace(/\D/g, ''),
          cellphone: customerData.phone.replace(/\D/g, '')
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
      return new Response(JSON.stringify({ error: "Erro API Abacate", details: result }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ 
      orderId: order.id,
      brCode: result.data.brCode,
      brCodeBase64: result.data.brCodeBase64,
      barCode: result.data.barCode,
      url: result.data.url
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})