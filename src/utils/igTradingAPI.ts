// utils/igTradingAPI.ts
import axios from "axios";

const IG_API_BASE_URL = "https://api.ig.com/gateway/deal";

export interface IGAuthTokens {
  cst: string;
  xSecurityToken: string;
}

export interface TradeOrder {
  epic: string; // IG's market identifier (e.g., SPY option contract)
  size: number;
  direction: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  level?: number; // for LIMIT orders
  expiry: string; // e.g., "DFB" or specific date
  forceOpen?: boolean;
  guaranteedStop?: boolean;
  currencyCode?: string;
}

export interface TradeResponse {
  dealReference: string;
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
        "X-IG-API-KEY": process.env.IG_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json; charset=UTF-8",
      },
    }
  );

  return {
    cst: response.headers["cst"],
    xSecurityToken: response.headers["x-security-token"],
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
      currencyCode: order.currencyCode || "USD",
    },
    {
      headers: {
        "X-IG-API-KEY": process.env.IG_API_KEY!,
        CST: auth.cst,
        "X-SECURITY-TOKEN": auth.xSecurityToken,
        Version: "2",
        "Content-Type": "application/json",
        Accept: "application/json; charset=UTF-8",
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
      "X-IG-API-KEY": process.env.IG_API_KEY!,
      CST: auth.cst,
      "X-SECURITY-TOKEN": auth.xSecurityToken,
      Version: "3",
      Accept: "application/json; charset=UTF-8",
    },
  });
  return response.data;
}
