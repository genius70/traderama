import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { placeTrade } from '@/utils/igTradingAPI';

interface CopyTradingProps {
  strategyId: string;
}

const CopyTradingComponent: React.FC<CopyTradingProps> = ({ strategyId }) => {
  const { toast } = useToast();

  useEffect(() => {
    const executeCopyTrading = async (userStrategyId: string) => {
      try {
        // Fetch user strategy and original strategy details
        const { data: userStrategy, error: userStrategyError } = await supabase
          .from('user_strategies')
          .select('strategy_id, royalty_percentage, platform_fee_percentage, copied_from')
          .eq('id', userStrategyId)
          .single();
        if (userStrategyError) throw userStrategyError;

        const { data: strategy, error: strategyError } = await supabase
          .from('trading_strategies')
          .select('strategy_config, status')
          .eq('id', userStrategy.strategy_id)
          .single();
        if (strategyError) throw strategyError;

        // Only execute trades for approved strategies
        if (strategy.status !== 'approved') {
          toast({ title: 'Strategy not approved', description: 'Cannot execute trades until strategy is approved.', variant: 'destructive' });
          return;
        }

        const { conditions, legs } = JSON.parse(strategy.strategy_config);

        // Simplified condition check (replace with actual logic)
        const conditionsMet = true; // Implement condition evaluation based on market data
        if (conditionsMet && legs.length > 0) {
          for (const leg of legs) {
            const tradeResponse = await placeTrade({
              epic: leg.epic,
              size: leg.size,
              direction: leg.buySell,
              orderType: 'MARKET',
              expiry: leg.expiration,
              currencyCode: 'USD',
            });

            // Assume tradeResponse contains trade_id and profit_amount (mocked for now)
            const trade_id = tradeResponse.trade_id || `trade_${Date.now()}`; // Replace with actual trade ID from IG API
            const profit_amount = tradeResponse.profit_amount || 0; // Replace with actual profit calculation

            // If profit is $1 or more, distribute royalties
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
              toast({
                title: 'Trade Executed',
                description: `Trade placed successfully. Royalties: $${creatorRoyaltyAmount.toFixed(2)} to creator, $${platformFeeAmount.toFixed(2)} to platform.`,
              });
            } else {
              toast({ title: 'Trade Executed', description: 'Trade placed successfully. No royalties due (profit < $1).', });
            }
          }
        }
      } catch (error) {
        console.error('Error executing copy trade:', error);
        toast({ title: 'Error executing trade', description: 'Failed to place trade or distribute royalties.', variant: 'destructive' });
      }
    };

    // Subscribe to user_strategies updates for the given strategyId
    const subscription = supabase
      .from('user_strategies')
      .on('INSERT', (payload) => {
        if (payload.new.strategy_id === strategyId && payload.new.status === 'active') {
          executeCopyTrading(payload.new.id);
        }
      })
      .on('UPDATE', (payload) => {
        if (payload.new.strategy_id === strategyId && payload.new.status === 'active') {
          executeCopyTrading(payload.new.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [strategyId, toast]);

  return null; // Headless component
};

export default CopyTradingComponent;
