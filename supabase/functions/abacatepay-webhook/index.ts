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

    const bodyText = await req.text()
    const payload = JSON.parse(bodyText)
    
    console.log(`[abacatepay-webhook] Evento: ${payload.event}`);
    
    // De acordo com a doc de Checkout Transparente:
    // O externalId está em data.transparent.externalId
    const event = payload.event
    const data = payload.data
    const orderId = data?.transparent?.externalId || data?.externalId

    if (!orderId) {
      console.warn("[abacatepay-webhook] Identificador de pedido não encontrado no payload");
      return new Response(JSON.stringify({ received: true }), { status: 200 })
    }

    // Status conforme documentação: transparent.completed
    if (event === 'transparent.completed' || event === 'checkout.completed') {
      console.log(`[abacatepay-webhook] SUCESSO: Pedido ${orderId} marcado como PAGO`);
      
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          status: 'Pago',
          updated_at: new Date().toISOString(),
          payment_details: data
        })
        .eq('id', orderId)

      if (error) throw error;
    } 
    else if (event === 'transparent.refunded') {
       console.log(`[abacatepay-webhook] REEMBOLSO: Pedido ${orderId}`);
       await supabaseClient
        .from('orders')
        .update({ status: 'Pagamento Estornado' })
        .eq('id', orderId)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[abacatepay-webhook] Falha no processamento:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})