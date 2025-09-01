import { authenticateIG, placeTrade, TradeOrder } from './igTradingAPI';
import { supabase } from '@/integrations/supabase/client';

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

interface TradingLeg {
  id: string;
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
  limitPrice?: string;
  underlying: string;
  epic: string;
}

interface TradingViewAlert {
  type: 'BUY' | 'SELL';
  symbol: string; // e.g., 'SPY'
  size: number; // e.g., 1 contract
  orderType: 'MARKET' | 'LIMIT';
  level?: number; // price for LIMIT orders
  expiry: string; // e.g., '2024-07-19'
  epic: string; // IG's market identifier
}

interface Strategy {
  strategy_config: string;
  status: string;
}

export async function handleCopyTrading(userStrategyId: string): Promise<void> {
  try {
    // Fetch user strategy and original strategy details
    const { data: userStrategy, error: userStrategyError } = await supabase
      .from('strategy_subscriptions')
      .select('strategy_id, fees_paid, total_profit')
      .eq('id', userStrategyId)
      .single();
    if (userStrategyError) throw new Error(`Failed to fetch user strategy: ${userStrategyError.message}`);

    const { data: strategy, error: strategyError } = await supabase
      .from('trading_strategies')
      .select('strategy_config, status')
      .eq('id', userStrategy.strategy_id)
      .single();
    if (strategyError) throw new Error(`Failed to fetch strategy: ${strategyError.message}`);

    // Ensure strategy is approved
    if (strategy.status !== 'published') {
      throw new Error('Strategy not published for trading');
    }

    const { conditions, legs }: { conditions: StrategyCondition[]; legs: TradingLeg[] } = JSON.parse(
      typeof strategy.strategy_config === 'string' 
        ? strategy.strategy_config 
        : JSON.stringify(strategy.strategy_config || {"conditions": [], "legs": []})
    );

    // Evaluate conditions (simplified; replace with actual market data check)
    const conditionsMet = evaluateConditions(conditions);
    if (!conditionsMet) {
      console.log('Conditions not met for trading');
      return;
    }

    // Authenticate with IG API
    const auth = await authenticateIG();

    // Execute trades for each leg
    for (const leg of legs) {
      const order: TradeOrder = {
        epic: leg.epic,
        size: leg.size,
        direction: leg.buySell.toUpperCase() as 'BUY' | 'SELL',
        orderType: leg.limitPrice ? 'LIMIT' : 'MARKET',
        level: leg.limitPrice ? parseFloat(leg.limitPrice) : undefined,
        expiry: leg.expiration,
        currencyCode: 'USD',
      };

      const tradeResult = await placeTrade(auth, order);
      console.log('✅ Trade placed successfully:', tradeResult);

      // Mock trade result data since IG API doesn't provide these fields directly
      const trade_id = tradeResult.dealReference || `trade_${Date.now()}`; // Use dealReference from IG API
      const profit_amount = Math.random() * 100; // Mock profit calculation

      // Distribute royalties if profit is $1 or more
      if (profit_amount >= 1) {
        const response = await fetch('/api/distribute-royalties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trade_id,
            user_strategy_id: userStrategyId,
            profit_amount,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to distribute royalties');
        }

        const { creatorRoyaltyAmount, platformFeeAmount } = await response.json();
        console.log(`✅ Royalties distributed: $${creatorRoyaltyAmount.toFixed(2)} to creator, $${platformFeeAmount.toFixed(2)} to platform`);
      }
    }
  } catch (error) {
    console.error('❌ Error in copy trading:', error);
    throw error; // Let caller handle errors
  }
}

// Simplified condition evaluation (replace with actual market data logic)
function evaluateConditions(conditions: StrategyCondition[]): boolean {
  // Implement logic to check indicators (e.g., RSI, MACD) against market data
  // For now, assume conditions are met
  return true;
}

// Maintain original TradingView alert handler for compatibility
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
      currencyCode: 'USD',
    };

    const result = await placeTrade(auth, order);
    console.log('✅ Trade placed successfully from TradingView alert:', result);
  } catch (error) {
    console.error('❌ Error placing trade from TradingView alert:', error);
    throw error;
  }
}
