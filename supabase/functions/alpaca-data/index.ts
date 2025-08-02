import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe, startDate, endDate } = await req.json();
    
    const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
    const ALPACA_API_SECRET = Deno.env.get('ALPACA_API_SECRET');
    const ALPACA_API_URL = Deno.env.get('ALPACA_API_URL') || 'https://paper-api.alpaca.markets';
    
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Alpaca API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = `${ALPACA_API_URL}/v2/stocks/${symbol}/bars?timeframe=${timeframe}&start=${startDate}&end=${endDate}`;
    
    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch data from Alpaca');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Alpaca data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});