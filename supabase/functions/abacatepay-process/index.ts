import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    console.log("[abacatepay-process] Iniciando processamento de pagamento...");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { customerData, total, items, userId } = await req.json()
    const apiKey = Deno.env.get('ABACATE_API_KEY')

    if (!apiKey) {
      console.error("[abacatepay-process] ABACATE_API_KEY não configurada nas Secrets.");
      throw new Error("Configuração de pagamento ausente no servidor.");
    }

    // 1. Criar pedido no banco de dados
    const { data: order, error: orderError } = await supabaseClient.from('orders').insert({
      user_id: userId || null,
      total: total,
      customer_data: customerData,
      items: items,
      status: 'Pendente'
    }).select().single()

    if (orderError) {
      console.error("[abacatepay-process] Erro ao criar pedido no banco:", orderError);
      throw orderError;
    }

    // 2. Preparar payload conforme DOCUMENTAÇÃO OFICIAL
    // A doc exige: { method: "PIX", data: { amount: centavos, externalId: "...", customer: { ... } } }
    const abacatePayload = {
      method: "PIX",
      data: {
        amount: Math.round(total * 100), // Converte para centavos
        description: `Pedido #${order.id.split('-')[0]} na Loja`,
        externalId: order.id,
        customer: {
          name: customerData.fullName,
          email: customerData.email,
          taxId: customerData.cpf.replace(/\D/g, ''), // API costuma preferir apenas números ou formato padrão
          cellphone: customerData.phone.replace(/\D/g, '')
        }
      }
    }

    console.log("[abacatepay-process] Chamando API AbacatePay...");
    
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
      console.error("[abacatepay-process] Erro retornado pela AbacatePay:", result);
      return new Response(JSON.stringify({ 
        error: "Falha na comunicação com gateway", 
        details: result.error || result 
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // De acordo com a doc, os dados estão em result.data
    const pixData = result.data;

    console.log("[abacatepay-process] Pagamento PIX gerado com sucesso:", pixData.id);

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
    console.error("[abacatepay-process] Erro inesperado:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
