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

    // 1. Criar pedido
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

    // 2. Payload dinâmico
    const abacatePayload = {
      method: method, // PIX ou BOLETO
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