import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API');
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const { symbols = ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD'] } = await req.json();

    console.log('Fetching market data for symbols:', symbols);

    const results = [];
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      
      try {
        // Add delay to avoid rate limits
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        
        const data = await response.json();

        if (data['Error Message'] || data['Note'] || !data['Global Quote']) {
          console.error(`API error for ${symbol}:`, data);
          continue;
        }

        const quote = data['Global Quote'];
        const marketData = {
          symbol,
          price: parseFloat(quote['05. price'] || '0') || 0,
          change_percent: parseFloat(quote['10. change percent']?.replace('%', '') || '0') || 0,
          volume: parseInt(quote['06. volume'] || '0') || 0,
          timestamp: new Date().toISOString(),
          source: 'alpha_vantage'
        };

        results.push(marketData);

        // Save to live_market_data table
        const { error: insertError } = await supabase
          .from('live_market_data')
          .upsert(marketData, { 
            onConflict: 'symbol',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error(`Error saving ${symbol} to database:`, insertError);
        }

      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    console.log(`Successfully processed ${results.length} symbols`);

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        message: `Fetched data for ${results.length} symbols`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in alpha-vantage-market-data function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});