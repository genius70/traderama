// utils/copyTradingEngine.ts
import { authenticateIG, placeTrade, TradeOrder } from "./igTradingAPI";

interface TradingViewAlert {
  type: "BUY" | "SELL";
  symbol: string; // e.g. "SPY"
  size: number;   // e.g. 1 contract
  orderType: "MARKET" | "LIMIT";
  level?: number; // price for LIMIT orders
  expiry: string; // e.g. "2024-07-19"
  epic: string;   // IG's market identifier, e.g. "SPY.OPT.19JUL24.520.C"
}

export async function handleTradingViewAlert(alert: TradingViewAlert): Promise<void> {
  try {
    const auth = await authenticateIG();

    const order: TradeOrder = {
      epic: alert.epic,
      size: alert.size,
      direction: alert.type,
      orderType: alert.orderType,
      level: alert.level,
      expiry: alert.expiry,
    };

    const result = await placeTrade(auth, order);
    console.log("✅ Trade placed successfully:", result);
  } catch (error) {
    console.error("❌ Error placing trade from TradingView alert:", error);
  }
}
