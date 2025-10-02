// supabase/functions/distribute-royalties/index.ts
import { serve } from 'https://deno.land/std@0.223.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

serve(async (req) => {
  try {
    const { trade_id, user_strategy_id, profit_amount } = await req.json();

    // Validate profit amount
    if (profit_amount < 1) {
      return new Response(JSON.stringify({ error: 'Profit must be $1 or more' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch user strategy details
    const { data: userStrategy, error: userStrategyError } = await supabase
      .from('user_strategies')
      .select('royalty_percentage, platform_fee_percentage, strategy_id, copied_from')
      .eq('id', user_strategy_id)
      .single();
    if (userStrategyError) throw userStrategyError;

    // Fetch strategy creator
    const { data: strategy, error: strategyError } = await supabase
      .from('trading_strategies')
      .select('creator_id')
      .eq('id', userStrategy.copied_from)
      .single();
    if (strategyError) throw strategyError;

    // Calculate royalties
    const creatorRoyaltyAmount = (profit_amount * userStrategy.royalty_percentage) / 100;
    const platformFeeAmount = (profit_amount * userStrategy.platform_fee_percentage) / 100;

    // Record royalty payment
    const { error: paymentError } = await supabase.from('royalty_payments').insert({
      user_strategy_id,
      trade_id,
      strategy_id: userStrategy.copied_from,
      creator_id: strategy.creator_id,
      profit_amount,
      creator_royalty_amount: creatorRoyaltyAmount,
      platform_fee_amount: platformFeeAmount,
      created_at: new Date().toISOString(),
    });
    if (paymentError) throw paymentError;

    // Notify creator of royalty payment
    await supabase.from('notifications').insert({
      user_id: strategy.creator_id,
      message: `Received royalty payment of $${creatorRoyaltyAmount.toFixed(2)} for trade ${trade_id}.`,
      type: 'royalty_payment',
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, creatorRoyaltyAmount, platformFeeAmount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in distribute-royalties:', error);
    return new Response(JSON.stringify({ error: 'Failed to distribute royalties' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
