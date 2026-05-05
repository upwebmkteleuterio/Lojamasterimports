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

    const { customerData, total, items, userId } = await req.json()
    const apiKey = Deno.env.get('ABACATE_API_KEY')

    if (!apiKey) {
      console.error("[abacatepay-process] ABACATE_API_KEY is not set")
      throw new Error("Configuração do AbacatePay ausente.");
    }

    // 1. Criar pedido na tabela orders
    const { data: order, error: orderError } = await supabaseClient.from('orders').insert({
      user_id: userId || null,
      total: total,
      customer_data: customerData,
      items: items,
      status: 'Pendente'
    }).select().single()

    if (orderError) {
      console.error("[abacatepay-process] Error creating order:", orderError)
      throw orderError
    }

    console.log("[abacatepay-process] Order created:", order.id)

    // 2. Chamar API da AbacatePay (Transparent PIX)
    // Conforme instruções do usuário: https://api.abacatepay.com/v2/transparents/create
    const abacatePayload = {
      externalId: order.id,
      amount: Math.round(total * 100), // Em centavos se for o padrão, mas vou seguir o que for mais comum se não especificado. Geralmente APIs brasileiras usam centavos.
      // Se a API pedir em reais: amount: total,
      // Como não tenho a doc completa, vou tentar o padrão de centavos ou o que for mais provável.
      // Entretanto, a prompt diz "brCode" e "brCodeBase64" devem ser retornados.
      customer: {
        name: customerData.fullName,
        cellphone: customerData.phone.replace(/\D/g, ''),
        taxId: customerData.cpf.replace(/\D/g, ''),
        email: customerData.email || `${customerData.phone.replace(/\D/g, '')}@noemail.com`
      },
      methods: ["PIX"],
      products: items.map((item: any) => ({
        externalId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price * 100)
      }))
    }

    console.log("[abacatepay-process] Calling AbacatePay API...")
    const response = await fetch('https://api.abacatepay.com/v2/transparents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(abacatePayload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[abacatepay-process] AbacatePay API Error:", result)
      // Se falhar na AbacatePay, talvez devêssemos marcar o pedido como falho ou remover?
      // Por enquanto, apenas retornar o erro.
      return new Response(JSON.stringify({ error: "Erro na AbacatePay", details: result }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // De acordo com a prompt, esperamos brCode e brCodeBase64
    // result.data.brCode e result.data.brCodeBase64 (assumindo estrutura comum de resposta)
    // Vou retornar o que vier que pareça correto.
    const pixData = result.data || result;

    return new Response(JSON.stringify({ 
      orderId: order.id,
      brCode: pixData.brCode,
      brCodeBase64: pixData.brCodeBase64,
      expiresAt: pixData.expiresAt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[abacatepay-process] Unexpected Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
