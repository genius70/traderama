// supabase/functions/strategy-publish/index.ts
import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

serve(async (req) => {
  try {
    const { strategy_id, status } = await req.json();
    const { data: strategy, error: strategyError } = await supabase
      .from('trading_strategies')
      .select('creator_id, title')
      .eq('id', strategy_id)
      .single();

    if (strategyError) throw strategyError;

    if (strategy) {
      await supabase.from('notifications').insert({
        user_id: strategy.creator_id,
        message: `Your strategy "${strategy.title}" has been ${status}.`,
        type: 'strategy_status',
        created_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in strategy-publish:', error);
    return new Response(JSON.stringify({ error: 'Failed to process notification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
