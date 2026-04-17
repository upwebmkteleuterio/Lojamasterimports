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

    const { formData, orderId, customerData, cart, total } = await req.json()
    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')

    if (!accessToken) {
      console.error("[process-payment] MERCADO_PAGO_ACCESS_TOKEN not found")
      return new Response(JSON.stringify({ error: "Configuração do servidor incompleta" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log("[process-payment] Processing order", orderId)

    // Prepare payload for Mercado Pago Orders API
    // Documentation shows: /v1/orders
    const mpPayload = {
      type: "online",
      processing_mode: "automatic",
      total_amount: total.toFixed(2),
      external_reference: orderId,
      payer: {
        email: customerData.email,
        first_name: customerData.fullName.split(' ')[0],
        last_name: customerData.fullName.split(' ').slice(1).join(' ') || ' ',
        identification: {
          type: "CPF",
          number: customerData.cpf.replace(/\D/g, '')
        },
        address: {
          zip_code: customerData.zipCode.replace(/\D/g, ''),
          street_name: customerData.address,
          street_number: customerData.number,
          city: customerData.city,
          state: customerData.state
        }
      },
      transactions: {
        payments: [
          {
            amount: total.toFixed(2),
            payment_method: {
              id: formData.payment_method_id,
              type: formData.payment_type_id || (formData.payment_method_id === 'pix' ? 'bank_transfer' : 'credit_card'),
              token: formData.token,
              installments: formData.installments || 1
            }
          }
        ]
      }
    }

    const response = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': orderId
      },
      body: JSON.stringify(mpPayload)
    })

    const mpResult = await response.json()

    if (!response.ok) {
      console.error("[process-payment] Mercado Pago Error", mpResult)
      return new Response(JSON.stringify({ error: mpResult.message || "Erro no processamento do pagamento" }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payment = mpResult.transactions?.payments?.[0]
    
    // Update our order with MP info
    await supabaseClient
      .from('orders')
      .update({
        mp_order_id: mpResult.id,
        mp_payment_id: payment?.id,
        payment_method: formData.payment_method_id,
        payment_status: mpResult.status,
        payment_status_detail: mpResult.status_detail,
        payment_details: payment?.payment_method || {},
        status: mapStatus(mpResult.status)
      })
      .eq('id', orderId)

    return new Response(JSON.stringify(mpResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("[process-payment] Unexpected Error", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
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
