import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Require authenticated admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - super_admin required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { user_ids, reward_amount } = await req.json();

    if (!Array.isArray(user_ids) || user_ids.length === 0 || !Number.isFinite(reward_amount)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. Expect { user_ids: string[], reward_amount: number }' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, credits')
      .in('id', user_ids);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Error fetching users', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const updates = users.map((user) => ({
      id: user.id,
      credits: (user.credits || 0) + reward_amount,
    }));

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Error updating credits', details: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fire in-app notifications via the existing send-notifications function
    // We pass through the same Authorization header so the function can verify permissions
    const { error: notifyError } = await (async () => {
      try {
        const { error: fnError } = await supabase.functions.invoke('send-notifications', {
          body: {
            user_ids,
            subject: 'Airdrop Credits Awarded',
            message: `You received ${reward_amount} airdrop credits!`,
            delivery_method: 'notification',
          },
          headers: { Authorization: authHeader },
        });
        return { error: fnError };
      } catch (e) {
        return { error: e } as { error: any };
      }
    })();

    if (notifyError) {
      // Soft-fail notifications but return success for credits update
      console.error('send-notifications error:', notifyError);
    }

    return new Response(
      JSON.stringify({ success: true, updated: updates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    console.error('airdrop-distribute error:', e);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: e?.message || String(e) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
