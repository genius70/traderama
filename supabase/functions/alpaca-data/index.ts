const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { symbol, symbols, timeframe, startDate, endDate } = body;
    
    const ALPACA_API_KEY = Deno.env.get('ALPACA_API_KEY');
    const ALPACA_API_SECRET = Deno.env.get('ALPACA_API_SECRET');
    const ALPACA_DATA_URL = 'https://data.alpaca.markets';
    
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Alpaca API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
    };

    let results = [];

    if (symbols && Array.isArray(symbols)) {
      // Handle multiple symbols for market data cards
      for (const sym of symbols) {
        try {
          const url = `${ALPACA_DATA_URL}/v2/stocks/${sym}/bars?timeframe=1Day&start=${startDate}&end=${endDate}&limit=10`;
          const response = await fetch(url, { headers });
          
          if (!response.ok) {
            console.error(`Failed to fetch ${sym}:`, response.status);
            continue;
          }

          const data = await response.json();
          if (data.bars && data.bars.length > 0) {
            const bars = data.bars.map((bar: any) => ({
              ticker: sym,
              t: new Date(bar.t).getTime(),
              o: bar.o,
              h: bar.h,
              l: bar.l,
              c: bar.c,
              v: bar.v
            }));
            results.push(...bars);
          }
        } catch (error) {
          console.error(`Error fetching ${sym}:`, error);
        }
      }
    } else if (symbol) {
      // Handle single symbol for chart data
      const alpacaTimeframe = timeframe?.multiplier && timeframe?.timespan 
        ? `${timeframe.multiplier}${timeframe.timespan === 'minute' ? 'Min' : 
            timeframe.timespan === 'hour' ? 'Hour' : 
            timeframe.timespan === 'day' ? 'Day' : 
            timeframe.timespan === 'week' ? 'Week' : 'Month'}`
        : '1Day';

      const url = `${ALPACA_DATA_URL}/v2/stocks/${symbol}/bars?timeframe=${alpacaTimeframe}&start=${startDate}&end=${endDate}&limit=1000`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch data for ${symbol}`);
      }

      const data = await response.json();
      if (data.bars && data.bars.length > 0) {
        results = data.bars.map((bar: any) => ({
          ticker: symbol,
          t: new Date(bar.t).getTime(),
          o: bar.o,
          h: bar.h,
          l: bar.l,
          c: bar.c,
          v: bar.v
        }));
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Either symbol or symbols parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'OK', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Alpaca data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});