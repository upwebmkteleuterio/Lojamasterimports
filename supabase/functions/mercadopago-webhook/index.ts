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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('id') || url.searchParams.get('data.id')

    console.log(`[mercadopago-webhook] Received notification: Topic=${topic}, ID=${id}`)

    if ((topic === 'order' || topic === 'merchant_order') && id) {
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      
      // Fetch order details from Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const mpOrder = await response.json()
        const orderId = mpOrder.external_reference // We saved our order ID here
        const payment = mpOrder.transactions?.payments?.[0]

        console.log(`[mercadopago-webhook] Updating order ${orderId} to status ${mpOrder.status}`)

        if (orderId) {
          await supabaseClient
            .from('orders')
            .update({
              payment_status: mpOrder.status,
              payment_status_detail: mpOrder.status_detail,
              status: mapStatus(mpOrder.status),
              mp_payment_id: payment?.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[mercadopago-webhook] Error", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 to MP to avoid retries on simple processing errors
    })
  }
})

function mapStatus(mpStatus) {
  switch (mpStatus) {
    case 'processed':
    case 'approved':
      return 'Pago';
    case 'action_required':
      return 'Pagamento Pendente';
    case 'rejected':
      return 'Cancelado';
    case 'cancelled':
      return 'Cancelado';
    case 'in_process':
      return 'Em Processamento';
    default:
      return 'Pendente';
  }
}
