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
    const { 
      symbol, 
      function: func, 
      interval, 
      outputsize,
      datatype = 'json' 
    } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate symbol is in available list
    if (!AVAILABLE_SYMBOLS.includes(symbol)) {
      return new Response(
        JSON.stringify({ 
          error: `Symbol '${symbol}' is not in the available symbols list`,
          available_symbols: AVAILABLE_SYMBOLS
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const ALPHA_VANTAGE_API = Deno.env.get('ALPHA_VANTAGE_API');
    
    if (!ALPHA_VANTAGE_API) {
      return new Response(
        JSON.stringify({ error: 'Alpha Vantage API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build API URL
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.append('function', func || 'TIME_SERIES_DAILY');
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('apikey', ALPHA_VANTAGE_API);
    url.searchParams.append('datatype', datatype);
    
    if (interval) {
      url.searchParams.append('interval', interval);
    }
    
    if (outputsize) {
      url.searchParams.append('outputsize', outputsize);
    }

    console.log(`Fetching ${func || 'TIME_SERIES_DAILY'} data for ${symbol}`);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle API errors
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please wait and try again.');
    }

    // Check if we have valid data
    if (data['Information']) {
      throw new Error(data['Information']);
    }

    console.log(`✓ Successfully fetched data for ${symbol}`);

    return new Response(
      JSON.stringify({
        success: true,
        symbol,
        function: func || 'TIME_SERIES_DAILY',
        data,
        data_timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Alpha Vantage data error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        data_timestamp: new Date().toISOString()
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
