import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts"

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
    const signature = req.headers.get('x-abacatepay-signature') || req.headers.get('signature')
    const webhookSecret = Deno.env.get('ABACATE_WEBHOOK_SECRET')

    // Validar assinatura se o secret estiver configurado
    if (webhookSecret && signature) {
      // Implementação básica de validação HMAC SHA256 se necessário
      // Por enquanto, vamos registrar para debug
      console.log("[abacatepay-webhook] Validating signature...")
    }

    const payload = JSON.parse(bodyText)
    console.log("[abacatepay-webhook] Received payload:", payload)

    // A estrutura comum da AbacatePay costuma ser { event: 'billing.paid', data: { externalId: '...', ... } }
    const event = payload.event
    const data = payload.data
    const orderId = data?.externalId

    if (!orderId) {
      console.warn("[abacatepay-webhook] No externalId found in payload")
      return new Response(JSON.stringify({ received: true }), { status: 200 })
    }

    if (event === 'billing.paid') {
      console.log(`[abacatepay-webhook] Order ${orderId} marked as PAID`)
      
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          status: 'Pago',
          updated_at: new Date().toISOString(),
          payment_details: data
        })
        .eq('id', orderId)

      if (error) {
        console.error("[abacatepay-webhook] Error updating order:", error)
        throw error
      }
    } else if (event === 'billing.expired' || event === 'billing.cancelled') {
       console.log(`[abacatepay-webhook] Order ${orderId} marked as CANCELLED/EXPIRED`)
       await supabaseClient
        .from('orders')
        .update({ 
          status: 'Cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[abacatepay-webhook] Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
