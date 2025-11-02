import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { user_id, strategy_id, trade_details } = await req.json();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, broker_connected')
    .eq('id', user_id)
    .single();

  if (profileError || !profile.broker_connected || profile.role !== 'premium_member') {
    return new Response('Unauthorized or no broker connection', { status: 403 });
  }

  // Call IG Broker API (pseudo-code)
  const tradeResponse = await fetch('https://api.ig.com/trade', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('IG_API_KEY')}` },
    body: JSON.stringify(trade_details),
  });

  if (!tradeResponse.ok) return new Response('Trade execution failed', { status: 500 });

  const { error } = await supabase
    .from('trades')
    .insert({ user_id, strategy_id, details: trade_details, status: 'executed' });

  if (error) return new Response('Error logging trade', { status: 500 });

  return new Response('Trade executed', { status: 200 });
});
