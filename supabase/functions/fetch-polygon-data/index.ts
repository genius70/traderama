import { corsHeaders, handleCorsPreFlight, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';
import { parseJsonBody } from '../_shared/request.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreFlight();
  }

  try {
    const body = await parseJsonBody<{
      symbols?: string[];
      symbol?: string;
      timeframe?: { multiplier: number; timespan: string };
      startDate?: string;
      endDate?: string;
    }>(req);

    if (!body) {
      return createErrorResponse('Invalid or empty request body', 400);
    }

    const { symbols, symbol, timeframe, startDate, endDate } = body;
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    
    if (!apiKey) {
      return createErrorResponse('Polygon.io API key is missing', 500);
    }

    let results = [];

    if (symbols) {
      // Handle multiple symbols (for fetchMarketData)
      for (const s of symbols) {
        const response = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${s}/range/1/day/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${apiKey}`
        );
      if (!response.ok) {
        return createErrorResponse(`HTTP error ${response.status}`, response.status);
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
          return createErrorResponse(`HTTP error ${response.status}`, response.status);
        }
      const data = await response.json();
      if (data.status !== 'OK' || !data.results) {
        throw new Error(data.error || `No data for ${symbol}`);
      }
      results = data.results;
    } else {
      return createErrorResponse('Invalid request parameters', 400);
    }

    return createJsonResponse({ status: 'OK', results });
  } catch (err) {
    console.error('Edge Function error:', err);
    return createErrorResponse(err.message, 500);
  }
});
