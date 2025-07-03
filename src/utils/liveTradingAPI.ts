// utils/liveTradingAPI.ts

export type LivePosition = {
  id: string;
  symbol: string;
  strategy: string;
  contracts: number;
  entry: number;
  mark: number;
  pnl: number;
  status: string;
  closeDate?: string;
  exit?: number;
};

export type TradeOrderRequest = {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  orderType: "market" | "limit";
  limitPrice?: number;
  strategy?: string;
  legs?: unknown[];
  timeInForce?: string;
};

export type AccountInfo = {
  balance: number;
  equity: number;
  marginUsed: number;
  marginAvailable: number;
  buyingPower: number;
  cashBalance: number;
  dayTradingBuyingPower: number;
  openPositions: LivePosition[];
};

export type RiskAssessment = {
  riskLevel: "low" | "medium" | "high";
  maxTradeSize: number;
  recommendedAction: string;
  maxLoss: number;
  maxGain: number;
  marginRequirement: number;
  warnings?: string[];
};

export type LiveOptionContract = {
  strike: number;
  type: "Call" | "Put";
  expiry: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  percentChange: number;
};

// Simulated account data
const dummyAccount: AccountInfo = {
  balance: 50000,
  equity: 52500,
  marginUsed: 15000,
  marginAvailable: 35000,
  buyingPower: 200000,
  cashBalance: 35000,
  dayTradingBuyingPower: 400000,
  openPositions: [
    {
      id: "1",
      symbol: "SPY",
      strategy: "Iron Condor",
      contracts: 5,
      entry: 2.5,
      mark: 1.85,
      pnl: 325,
      status: "Open",
    },
    {
      id: "2",
      symbol: "QQQ",
      strategy: "Put Spread",
      contracts: 10,
      entry: 1.2,
      mark: 0.95,
      pnl: 250,
      status: "Open",
    },
  ],
};

// Mock positions data structure
const mockPositionsData = {
  open: [
    {
      id: "1",
      symbol: "SPY",
      strategy: "Iron Condor",
      contracts: 5,
      entry: 2.5,
      mark: 1.85,
      pnl: 325,
      status: "Open",
    },
  ],
  closed: [
    {
      id: "2",
      symbol: "AAPL",
      strategy: "Call Spread",
      contracts: 3,
      entry: 1.75,
      exit: 2.25,
      pnl: 150,
      status: "Closed",
      closeDate: "2024-01-15",
    },
  ],
};

// Simulated live price feed via WebSocket
export class LivePriceWebSocket {
  private listeners: ((
    priceData: { symbol: string; price: number },
  ) => void)[] = [];

  connect() {
    console.log("Connected to LivePriceWebSocket (simulated)");
    setInterval(() => {
      const priceData = {
        symbol: "SPY",
        price: 450 + Math.random() * 10 - 5,
      };
      this.listeners.forEach(cb => cb(priceData));
    }, 2000);
  }

  onPriceUpdate(
    callback: (priceData: { symbol: string; price: number }) => void,
  ) {
    this.listeners.push(callback);
  }

  disconnect() {
    this.listeners = [];
    console.log("Disconnected from LivePriceWebSocket (simulated)");
  }
}

export async function fetchLivePositions(): Promise<typeof mockPositionsData> {
  await new Promise(res => setTimeout(res, 500));
  return mockPositionsData;
}

export async function submitTradeOrder(
  order: TradeOrderRequest,
): Promise<{
  success: boolean;
  message: string;
  status: string;
  orderId?: string;
  timestamp: string;
}> {
  await new Promise(res => setTimeout(res, 800));

  // Simulate success/failure
  const success = Math.random() > 0.1; // 90% success rate

  return {
    success,
    status: success ? "submitted" : "rejected",
    message: success
      ? `Trade order submitted successfully for ${order.quantity} contracts of ${order.symbol}`
      : "Trade order rejected due to insufficient buying power",
    orderId: success ? `ORD-${Date.now()}` : undefined,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchAccountInfo(): Promise<AccountInfo> {
  await new Promise(res => setTimeout(res, 400));
  return dummyAccount;
}

export async function assessTradeRisk(
  legs: unknown[],
): Promise<RiskAssessment> {
  await new Promise(res => setTimeout(res, 300));

  // Simple risk calculation based on number of legs
  const complexity = legs.length;
  const maxLoss = complexity * 500;
  const maxGain = complexity * 200;

  let riskLevel: "low" | "medium" | "high" = "low";
  if (maxLoss > 2000) riskLevel = "high";
  else if (maxLoss > 1000) riskLevel = "medium";

  return {
    riskLevel,
    maxTradeSize: 10000,
    recommendedAction:
      riskLevel === "high" ? "Reduce position size" : "Proceed with caution",
    maxLoss,
    maxGain,
    marginRequirement: maxLoss * 0.6,
    warnings:
      riskLevel === "high"
        ? ["High risk trade", "Consider reducing position size"]
        : [],
  };
}

export async function fetchLiveOptionsChain(
  symbol: string,
  expiry: string,
): Promise<LiveOptionContract[]> {
  await new Promise(res => setTimeout(res, 600));

  // Generate mock options chain
  const strikes = [440, 445, 450, 455, 460, 465, 470];
  const options: LiveOptionContract[] = [];

  strikes.forEach(strike => {
    // Calls
    options.push({
      strike,
      type: "Call",
      expiry,
      bid: Math.random() * 5 + 1,
      ask: Math.random() * 5 + 2,
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      impliedVolatility: Math.random() * 0.5 + 0.1,
      delta: Math.random() * 0.8 + 0.1,
      gamma: Math.random() * 0.05,
      theta: -Math.random() * 0.1,
      vega: Math.random() * 0.3,
      percentChange: (Math.random() - 0.5) * 20,
    });

    // Puts
    options.push({
      strike,
      type: "Put",
      expiry,
      bid: Math.random() * 5 + 1,
      ask: Math.random() * 5 + 2,
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      impliedVolatility: Math.random() * 0.5 + 0.1,
      delta: -Math.random() * 0.8 - 0.1,
      gamma: Math.random() * 0.05,
      theta: -Math.random() * 0.1,
      vega: Math.random() * 0.3,
      percentChange: (Math.random() - 0.5) * 20,
    });
  });

  return options;
}
