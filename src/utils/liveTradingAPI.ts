// utils/liveTradingAPI.ts

export type LivePosition = {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number; // Profit or Loss
};

export type TradeOrderRequest = {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  orderType: "market" | "limit";
  limitPrice?: number;
};

export type AccountInfo = {
  balance: number;
  equity: number;
  marginUsed: number;
  marginAvailable: number;
  openPositions: LivePosition[];
};

export type RiskAssessment = {
  riskLevel: "low" | "medium" | "high";
  maxTradeSize: number;
  recommendedAction: string;
};

// Simulated account data
const dummyAccount: AccountInfo = {
  balance: 10000,
  equity: 10250,
  marginUsed: 2000,
  marginAvailable: 8000,
  openPositions: [
    {
      symbol: "BTCUSD",
      quantity: 0.1,
      entryPrice: 50000,
      currentPrice: 51000,
      pnl: 100,
    },
  ],
};

// Simulated live price feed via WebSocket
export class LivePriceWebSocket {
  private listeners: ((priceData: { symbol: string; price: number }) => void)[] = [];

  connect() {
    console.log("Connected to LivePriceWebSocket (simulated)");
    setInterval(() => {
      const priceData = {
        symbol: "BTCUSD",
        price: 50000 + Math.random() * 1000 - 500, // simulate fluctuation
      };
      this.listeners.forEach((cb) => cb(priceData));
    }, 1000);
  }

  onPriceUpdate(callback: (priceData: { symbol: string; price: number }) => void) {
    this.listeners.push(callback);
  }

  disconnect() {
    this.listeners = [];
    console.log("Disconnected from LivePriceWebSocket (simulated)");
  }
}

export async function fetchLivePositions(): Promise<LivePosition[]> {
  // Simulated delay
  await new Promise((res) => setTimeout(res, 500));
  return dummyAccount.openPositions;
}

export async function submitTradeOrder(order: TradeOrderRequest): Promise<{ success: boolean; message: string }> {
  await new Promise((res) => setTimeout(res, 300));
  return {
    success: true,
    message: `Trade order to ${order.side} ${order.quantity} ${order.symbol} submitted.`,
  };
}

export async function fetchAccountInfo(): Promise<AccountInfo> {
  await new Promise((res) => setTimeout(res, 400));
  return dummyAccount;
}

export async function assessTradeRisk(order: TradeOrderRequest): Promise<RiskAssessment> {
  const { quantity } = order;
  const maxAllowed = dummyAccount.balance * 0.1;
  let riskLevel: "low" | "medium" | "high" = "low";

  if (quantity > maxAllowed * 2) {
    riskLevel = "high";
  } else if (quantity > maxAllowed) {
    riskLevel = "medium";
  }

  return {
    riskLevel,
    maxTradeSize: maxAllowed,
    recommendedAction:
      riskLevel === "high" ? "Reduce order size" : riskLevel === "medium" ? "Proceed with caution" : "Proceed",
  };
}
