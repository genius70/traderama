import { serve } from "/std/http/server.ts";

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
    const { symbol, function: func, interval, outputsize } = await req.json();
    
    const ALPHA_VANTAGE_API = Deno.env.get('ALPHA_VANTAGE_API');
    
    if (!ALPHA_VANTAGE_API) {
      return new Response(
        JSON.stringify({ error: 'Alpha Vantage API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.append('function', func || 'TIME_SERIES_DAILY');
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('apikey', ALPHA_VANTAGE_API);
    
    if (interval) {
      url.searchParams.append('interval', interval);
    }
    
    if (outputsize) {
      url.searchParams.append('outputsize', outputsize);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please wait and try again.');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Alpha Vantage data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});