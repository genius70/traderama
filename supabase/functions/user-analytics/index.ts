import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  const { user_id } = await req.json();

  const { data: trades, error } = await supabase
    .from('trades')
    .select('profit_loss, status')
    .eq('user_id', user_id);

  if (error) return new Response('Error fetching trades', { status: 500 });

  const totalTrades = trades.length;
  const successfulTrades = trades.filter(t => t.status === 'executed' && t.profit_loss > 0).length;
  const successRate = totalTrades ? (successfulTrades / totalTrades) * 100 : 0;

  const { error: updateError } = await supabase
    .from('analytics')
    .upsert({ user_id, success_rate: successRate, total_trades: totalTrades }, { onConflict: 'user_id' });

  if (updateError) return new Response('Error saving analytics', { status: 500 });

  return new Response('Analytics updated', { status: 200 });
});
