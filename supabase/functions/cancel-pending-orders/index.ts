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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[cancel-pending-orders] Missing Supabase variables");
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    console.log(`[cancel-pending-orders] Canceling pending orders created before: ${twoDaysAgo.toISOString()}`);

    // Fetch and update orders
    // The user requested status: 'Cancelado'
    const { data: updatedOrders, error } = await supabase
      .from('orders')
      .update({ status: 'Cancelado' })
      .in('status', ['Pendente', 'Pagamento Pendente'])
      .lt('created_at', twoDaysAgo.toISOString())
      .select('id, status');

    if (error) {
      console.error("[cancel-pending-orders] Error updating orders:", error);
      throw error;
    }

    console.log(`[cancel-pending-orders] Successfully canceled ${updatedOrders?.length || 0} orders.`);

    return new Response(
      JSON.stringify({ 
        message: 'Success', 
        canceled_count: updatedOrders?.length || 0,
        orders: updatedOrders
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error("[cancel-pending-orders] Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
