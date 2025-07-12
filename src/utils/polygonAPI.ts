// src/utils/polygonAPI.ts
import { Contract } from '@/components/trading/LiveOptionsChain';

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
  
  return data.results.map((contract: PolygonContract) => ({
    id: contract.details.ticker, // e.g., O:SPY250117C00450000
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
  // For simplicity, return a static list of underlyings; optionally fetch dynamically
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
