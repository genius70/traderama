import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All 20 available option symbols
const AVAILABLE_SYMBOLS = [
  'SPY', 'QQQ', 'IWM', 'VIX', 'GLD', 'DIA', 'EEM', 'TLT', 
  'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 
  'XLB', 'XLRE', 'XLC', 'SMH'
];

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

    const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API');
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key not configured');
    }

    // Get custom symbols from request or use all available
    const { symbols = AVAILABLE_SYMBOLS } = await req.json().catch(() => ({ symbols: AVAILABLE_SYMBOLS }));
    const symbolsToFetch = Array.isArray(symbols) ? symbols : AVAILABLE_SYMBOLS;

    console.log(`Fetching market data for ${symbolsToFetch.length} symbols:`, symbolsToFetch);

    const results = [];
    const errors = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < symbolsToFetch.length; i++) {
      const ticker = symbolsToFetch[i];
      
      try {
        // Rate limiting: Alpha Vantage free tier allows 5 requests per minute
        // Add 12 second delay between requests to stay under limit
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 12000));
        }

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle API errors
        if (data['Error Message']) {
          console.error(`API error for ${ticker}:`, data['Error Message']);
          errors.push({ ticker, error: data['Error Message'] });
          continue;
        }

        if (data['Note']) {
          console.error(`Rate limit reached for ${ticker}`);
          errors.push({ ticker, error: 'Rate limit reached' });
          // Stop processing if we hit rate limit
          break;
        }

        // Check if we have valid results
        if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
          console.warn(`No data available for ${ticker}`);
          errors.push({ ticker, error: 'No data available' });
          continue;
        }

        const quote = data['Global Quote'];
        const marketData = {
          ticker,
          price: parseFloat(quote['05. price'] || '0') || 0,
          open: parseFloat(quote['02. open'] || '0') || 0,
          high: parseFloat(quote['03. high'] || '0') || 0,
          low: parseFloat(quote['04. low'] || '0') || 0,
          volume: parseInt(quote['06. volume'] || '0') || 0,
          change_percent: parseFloat(quote['10. change percent']?.replace('%', '') || '0') || 0,
          previous_close: parseFloat(quote['08. previous close'] || '0') || 0,
          timestamp: new Date(quote['07. latest trading day']).toISOString(),
          synced_at: new Date().toISOString(),
        };

        // Insert or update market data
        const { error: insertError } = await supabase
          .from('market_data')
          .upsert(marketData, {
            onConflict: 'ticker',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.error(`Error saving ${ticker}:`, insertError);
          errors.push({ ticker, error: insertError.message });
        } else {
          results.push(marketData);
          console.log(`✓ Synced ${ticker}: ${marketData.price} (${marketData.change_percent > 0 ? '+' : ''}${marketData.change_percent.toFixed(2)}%)`);
        }

      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error);
        errors.push({ ticker, error: error.message });
      }
    }

    const response = {
      success: results.length > 0,
      synced: results.length,
      total: symbolsToFetch.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully synced ${results.length}/${symbolsToFetch.length} symbols`,
      timestamp: new Date().toISOString()
    };

    console.log(`Market data sync complete: ${results.length}/${symbolsToFetch.length} successful`);

    return new Response(
      JSON.stringify(response),
      { 
        status: results.length > 0 ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Market data sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
