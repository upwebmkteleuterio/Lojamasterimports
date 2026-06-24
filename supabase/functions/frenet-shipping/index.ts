import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { recipientCep, items } = await req.json()

    if (!recipientCep) {
      return new Response(JSON.stringify({ error: "CEP de destino é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "O carrinho de compras está vazio" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Inicializa o cliente Supabase com a Service Role para ler as chaves de configuração
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Busca as chaves e CEP de origem no banco de dados
    const { data: config, error: configError } = await supabaseClient
      .from('store_configs')
      .select('seller_cep, frenet_token')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (configError || !config) {
      console.error("[frenet-shipping] Erro ao buscar configurações no banco:", configError)
      return new Response(JSON.stringify({ error: "Configurações da loja não encontradas." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { seller_cep, frenet_token } = config

    if (!seller_cep || !frenet_token) {
      return new Response(JSON.stringify({ 
        error: "Configuração de frete incompleta no painel administrativo. CEP de origem ou Token Frenet ausentes." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calcula o valor total da nota para o seguro da cotação
    const invoiceValue = items.reduce((total: number, item: any) => {
      const price = item.promo_price || item.price || 0
      return total + (price * (item.quantity || 1))
    }, 0)

    // Formata o payload para a API da Frenet
    // Usamos valores padrão defensivos caso o produto não tenha peso ou dimensões cadastrados
    const shippingItemArray = items.map((item: any) => {
      const weight = Number(item.weight) > 0 ? Number(item.weight) : 0.3 // Padrão 300g
      const width = Number(item.width) > 0 ? Number(item.width) : 15 // Padrão 15cm
      const height = Number(item.height) > 0 ? Number(item.height) : 5 // Padrão 5cm
      const length = Number(item.length) > 0 ? Number(item.length) : 15 // Padrão 15cm

      return {
        Weight: weight,
        Length: length,
        Height: height,
        Width: width,
        Quantity: Number(item.quantity) || 1
      }
    })

    const cleanSellerCep = seller_cep.replace(/\D/g, '')
    const cleanRecipientCep = recipientCep.replace(/\D/g, '')

    const frenetPayload = {
      SellerCEP: cleanSellerCep,
      RecipientCEP: cleanRecipientCep,
      ShipmentInvoiceValue: Number(invoiceValue.toFixed(2)),
      ShippingItemArray: shippingItemArray
    }

    console.log("[frenet-shipping] Enviando cotação para a Frenet:", JSON.stringify(frenetPayload))

    // Faz a chamada à API da Frenet
    const response = await fetch('https://api.frenet.com.br/shipping/quote', {
      method: 'POST',
      headers: {
        'token': frenet_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(frenetPayload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[frenet-shipping] Erro retornado pela API Frenet:", result)
      return new Response(JSON.stringify({ error: "Erro ao cotar frete na Frenet", details: result }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Trata e limpa a resposta para enviar ao frontend
    if (result.ShippingSevicesArray && Array.isArray(result.ShippingSevicesArray)) {
      const activeServices = result.ShippingSevicesArray
        .filter((service: any) => !service.Error && Number(service.ShippingPrice) >= 0)
        .map((service: any) => ({
          name: service.ServiceDescription || service.Carrier,
          price: Number(service.ShippingPrice),
          deliveryTime: Number(service.DeliveryTime),
          carrier: service.Carrier,
          serviceCode: service.ServiceCode
        }))

      return new Response(JSON.stringify({ services: activeServices }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response(JSON.stringify({ services: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("[frenet-shipping] Erro crítico na Edge Function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
