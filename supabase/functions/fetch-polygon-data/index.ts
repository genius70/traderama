// functions/fetch-polygon-data/index.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

serve(async (req) => {
  try {
    const { symbols, symbol, timeframe, startDate, endDate } = await req.json();
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Polygon.io API key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let results = [];

    if (symbols) {
      // Handle multiple symbols (for fetchMarketData)
      for (const s of symbols) {
        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${s}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${apiKey}`
        );
        if (!response.ok) {
          return new Response(JSON.stringify({ error: `HTTP error ${response.status}` }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const data = await response.json();
        if (data.status !== 'OK' || !data.results) {
          throw new Error(data.error || `No data for ${s}`);
        }
        results.push(...data.results.map(item => ({ ...item, ticker: s })));
      }
    } else if (symbol && timeframe) {
      // Handle single symbol with timeframe (for fetchChartData)
      const { multiplier, timespan } = timeframe;
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${apiKey}`
      );
      if (!response.ok) {
        return new Response(JSON.stringify({ error: `HTTP error ${response.status}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const data = await response.json();
      if (data.status !== 'OK' || !data.results) {
        throw new Error(data.error || `No data for ${symbol}`);
      }
      results = data.results;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'OK', results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge Function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
