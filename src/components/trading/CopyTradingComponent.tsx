import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { handleCopyTrading } from '@/utils/copyTradingEngine';

interface CopyTradingProps {
  strategyId: string;
}

const CopyTradingComponent: React.FC<CopyTradingProps> = ({ strategyId }) => {
  const { toast } = useToast();

  useEffect(() => {
    const subscription = supabase
      .from('user_strategies')
      .on('INSERT', (payload) => {
        if (payload.new.strategy_id === strategyId && payload.new.status === 'active') {
          handleCopyTrading(payload.new.id)
            .then(() => {
              toast({ title: 'Trade Initiated', description: 'Copy trading started for the strategy.' });
            })
            .catch((error) => {
              toast({
                title: 'Error executing trade',
                description: error.message,
                variant: 'destructive',
              });
            });
        }
      })
      .on('UPDATE', (payload) => {
        if (payload.new.strategy_id === strategyId && payload.new.status === 'active') {
          handleCopyTrading(payload.new.id)
            .then(() => {
              toast({ title: 'Trade Initiated', description: 'Copy trading updated for the strategy.' });
            })
            .catch((error) => {
              toast({
                title: 'Error executing trade',
                description: error.message,
                variant: 'destructive',
              });
            });
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
