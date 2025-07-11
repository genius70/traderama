// src/utils/igTradingAPI.ts
import axios from 'axios';

const IG_API_BASE_URL = 'https://api.ig.com/gateway/deal';

export interface IGAuthTokens {
  cst: string;
  xSecurityToken: string;
}

export interface TradeOrder {
  epic: string; // IG's market identifier (e.g., SPY option contract)
  size: number;
  direction: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  level?: number; // for LIMIT orders
  expiry: string; // e.g., 'DFB' or specific date
  forceOpen?: boolean;
  guaranteedStop?: boolean;
  currencyCode?: string;
}

export interface TradeResponse {
  dealReference: string;
}

export interface Contract {
  epic: string;
  strike: number;
  type: 'Call' | 'Put';
  ask: number;
  bid: number;
  expiration: string; // e.g., '2025-08-15'
  underlying: string; // e.g., 'SPY'
}

export async function authenticateIG(): Promise<IGAuthTokens> {
  const response = await axios.post(
    `${IG_API_BASE_URL}/session`,
    {
      identifier: process.env.IG_USERNAME,
      password: process.env.IG_PASSWORD,
    },
    {
      headers: {
        'X-IG-API-KEY': process.env.IG_API_KEY!,
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=UTF-8',
      },
    }
  );

  return {
    cst: response.headers['cst'],
    xSecurityToken: response.headers['x-security-token'],
  };
}

export async function placeTrade(
  auth: IGAuthTokens,
  order: TradeOrder
): Promise<TradeResponse> {
  const response = await axios.post(
    `${IG_API_BASE_URL}/positions/otc`,
    {
      epic: order.epic,
      expiry: order.expiry,
      direction: order.direction,
      size: order.size,
      orderType: order.orderType,
      level: order.level,
      forceOpen: order.forceOpen || true,
      guaranteedStop: order.guaranteedStop || false,
      currencyCode: order.currencyCode || 'USD',
    },
    {
      headers: {
        'X-IG-API-KEY': process.env.IG_API_KEY!,
        CST: auth.cst,
        'X-SECURITY-TOKEN': auth.xSecurityToken,
        Version: '2',
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=UTF-8',
      },
    }
  );

  return {
    dealReference: response.data.dealReference,
  };
}

export async function fetchMarketDetails(epic: string, auth: IGAuthTokens) {
  const response = await axios.get(`${IG_API_BASE_URL}/markets/${epic}`, {
    headers: {
      'X-IG-API-KEY': process.env.IG_API_KEY!,
      CST: auth.cst,
      'X-SECURITY-TOKEN': auth.xSecurityToken,
      Version: '3',
      'Accept': 'application/json; charset=UTF-8',
    },
  });
  return response.data;
}

export async function fetchOptionsChainMetadata(auth: IGAuthTokens): Promise<{ underlyings: string[]; expirations: string[] }> {
  try {
    // Fetch available markets for options
    const response = await axios.get(`${IG_API_BASE_URL}/marketnavigation`, {
      headers: {
        'X-IG-API-KEY': process.env.IG_API_KEY!,
        CST: auth.cst,
        'X-SECURITY-TOKEN': auth.xSecurityToken,
        'Accept': 'application/json; charset=UTF-8',
      },
    });

    // Extract underlyings and expirations (simplified; adjust based on actual API response)
    const markets = response.data.nodes.filter((node: any) => node.type === 'OPTION');
    const underlyings = markets.map((node: any) => node.underlying).filter((u: string) => u);
    const expirations = markets.flatMap((node: any) => node.expirations || []).filter((e: string) => e);

    return {
      underlyings: [...new Set(underlyings)] as string[], // Remove duplicates
      expirations: [...new Set(expirations)] as string[], // Remove duplicates
    };
  } catch (error) {
    console.error('Error fetching options chain metadata:', error);
    throw error;
  }
}

export async function fetchOptionsChain({
  auth,
  underlying,
  expiration,
}: {
  auth: IGAuthTokens;
  underlying: string;
  expiration: string;
}): Promise<Contract[]> {
  try {
    // Fetch markets for the specified underlying and expiration
    const response = await axios.get(`${IG_API_BASE_URL}/markets`, {
      params: {
        filter: `underlying:${underlying},expiry:${expiration},type:OPTIONS`,
      },
      headers: {
        'X-IG-API-KEY': process.env.IG_API_KEY!,
        CST: auth.cst,
        'X-SECURITY-TOKEN': auth.xSecurityToken,
        'Accept': 'application/json; charset=UTF-8',
      },
    });

    // Map API response to Contract interface
    return response.data.markets.map((market: any) => ({
      epic: market.epic,
      strike: parseFloat(market.strikePrice),
      type: market.instrumentType === 'CALL_OPTIONS' ? 'Call' : 'Put',
      ask: parseFloat(market.offer),
      bid: parseFloat(market.bid),
      expiration: market.expiry,
      underlying: market.underlying,
    }));
  } catch (error) {
    console.error('Error fetching options chain:', error);
    throw error;
  }
}
