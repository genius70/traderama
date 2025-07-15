// src/utils/polygonAPI.ts
import { Contract } from '@/utils/igTradingAPI';

// Placeholder for Polygon.io API key (replace with your key or env variable)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY ;
const POLYGON_REST_BASE_URL = 'https://api.polygon.io';

// Interface for Polygon.io options contract response
interface PolygonContract {
  details: {
    ticker: string;
    strike_price: number;
    contract_type: 'call' | 'put';
    expiration_date: string;
  };
  day: {
    bid: number;
    ask: number;
  };
  underlying_asset: {
    ticker: string;
  };
}

// Fetch options chain data for a given underlying and expiration
export const fetchOptionsChain = async ({
  underlying,
  expiration,
}: {
  underlying: string;
  expiration: string;
}): Promise<Contract[]> => {
  const response = await fetch(
    `${POLYGON_REST_BASE_URL}/v2/snapshot/options/${underlying}?expiration_date=${expiration}&apiKey=${POLYGON_API_KEY}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch options chain');
  }
  const data = await response.json();

  // Map Polygon.io data to Contract interface
  return data.results.map((contract: PolygonContract) => ({
    epic: contract.details.ticker, // Placeholder: Map to IG epic via fetchMarketDetails if needed
    strike: contract.details.strike_price,
    type: contract.details.contract_type === 'call' ? 'Call' : 'Put',
    ask: contract.day.ask || 0,
    bid: contract.day.bid || 0,
    expiration: contract.details.expiration_date,
    underlying: contract.underlying_asset.ticker,
  }));
};

// Fetch available underlyings and expirations
export const fetchOptionsChainMetadata = async (): Promise<{
  underlyings: string[];
  expirations: string[];
}> => {
  // Static list of underlyings (extend with /v3/reference/tickers if needed)
  const underlyings = ['SPY', 'QQQ', 'SPX', 'VIX'];

  // Fetch expirations for the first underlying (e.g., SPY) as a default
  const response = await fetch(
    `${POLYGON_REST_BASE_URL}/v3/reference/options/contracts?underlying_ticker=SPY&apiKey=${POLYGON_API_KEY}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }
  const data = await response.json();
  const expirations = [...new Set(data.results.map((contract: any) => contract.expiration_date))].sort();

  return { underlyings, expirations };
};
