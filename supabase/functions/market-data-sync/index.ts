import { createClient } from "@supabase/supabase-js";
import { serve } from "std/http/server.ts";

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/SPY/range/1/minute/2025-07-15/2025-07-15?apiKey=${Deno.env.get('POLYGON_API_KEY')}`);
  const data = await response.json();

  const marketData = {
    ticker: 'SPY',
    price: data.results[0].c,
    volume: data.results[0].v,
    timestamp: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('market_data')
    .insert(marketData);

  if (error) return new Response('Error saving market data', { status: 500 });

  return new Response('Market data synced', { status: 200 });
});
