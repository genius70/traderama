import { createClient } from "@supabase/supabase-js";
import { serve } from "std/http/server.ts";

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  const payload = await req.json();
  const { record } = payload;

  if (record.status !== 'pending') return new Response('Invalid status', { status: 400 });

  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', record.creator_id)
    .single();

  if (userError || !['strategy_creator', 'premium_member'].includes(user.role)) {
    return new Response('Unauthorized', { status: 403 });
  }

  // Validate strategy (e.g., check fee_percentage, config)
  const isValid = record.fee_percentage >= 0 && record.strategy_config !== null;

  const { error } = await supabase
    .from('trading_strategies')
    .update({ status: isValid ? 'published' : 'rejected' })
    .eq('id', record.id);

  if (error) return new Response('Error updating strategy', { status: 500 });

  // Trigger notification
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notifications`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` },
    body: JSON.stringify({
      user_id: record.creator_id,
      message: `Strategy ${record.title} ${isValid ? 'published' : 'rejected'}.`,
    }),
  });

  return new Response('Strategy processed', { status: 200 });
});
