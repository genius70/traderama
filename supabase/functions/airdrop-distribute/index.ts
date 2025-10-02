import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { serve } from '/std/http/server.ts';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  const { user_ids, reward_amount } = await req.json();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, credits')
    .in('id', user_ids);

  if (error) return new Response('Error fetching users', { status: 500 });

  const updates = users.map(user => ({
    id: user.id,
    credits: (user.credits || 0) + reward_amount,
  }));

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'id' });

  if (updateError) return new Response('Error updating credits', { status: 500 });

  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notifications`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` },
    body: JSON.stringify({
      user_ids,
      message: `You received ${reward_amount} airdrop credits!`,
    }),
  });

  return new Response('Airdrop distributed', { status: 200 });
});
