import { serve } from "std/http/server.ts";

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
    const { symbol, resolution, from, to } = await req.json();
    
    const IG_API_KEY = Deno.env.get('IG_API_KEY');
    const IG_USERNAME = Deno.env.get('IG_USERNAME');
    const IG_PASSWORD = Deno.env.get('IG_PASSWORD');
    
    if (!IG_API_KEY || !IG_USERNAME || !IG_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'IG API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, authenticate with IG
    const authResponse = await fetch('https://demo-api.ig.com/gateway/deal/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-IG-API-KEY': IG_API_KEY,
        'Version': '2',
      },
      body: JSON.stringify({
        identifier: IG_USERNAME,
        password: IG_PASSWORD,
      }),
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      throw new Error(authData.errorCode || 'Authentication failed');
    }

    const cst = authResponse.headers.get('CST');
    const xSecurityToken = authResponse.headers.get('X-SECURITY-TOKEN');

    // Get market data
    const dataResponse = await fetch(
      `https://demo-api.ig.com/gateway/deal/prices/${symbol}/${resolution}/${from}/${to}`,
      {
        headers: {
          'X-IG-API-KEY': IG_API_KEY,
          'CST': cst!,
          'X-SECURITY-TOKEN': xSecurityToken!,
          'Version': '3',
        },
      }
    );

    const data = await dataResponse.json();

    if (!dataResponse.ok) {
      throw new Error(data.errorCode || 'Failed to fetch market data');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('IG data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});