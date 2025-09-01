
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IGBrokerCredentials {
  username: string;
  password: string;
  apiKey: string;
  accountId: string;
}

interface IGBrokerConnection {
  id: string;
  username: string;
  account_id: string;
  is_active: boolean;
  last_connected_at: string | null;
  created_at: string;
}

export const useIGBroker = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState<IGBrokerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connectToBroker = useCallback(async (credentials: IGBrokerCredentials) => {
    setIsConnecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ig-broker-connect', {
        body: credentials || undefined,
      });

      if (error) {
        throw new Error(error.message || 'Failed to connect to IG Broker');
      }

      if (data?.success) {
        setConnection(data.connection);
        toast({
          title: "Connection Successful",
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('IG Broker connection error:', error);
      toast({
        title: "Connection Failed",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const fetchConnection = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ig-broker-connect', {
        body: undefined,
      });

      if (error) {
        throw new Error(error.message);
      }

      setConnection(data?.connection || null);
    } catch (error) {
      console.error('Failed to fetch IG Broker connection:', error);
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectBroker = useCallback(async () => {
    setConnection(null);
    return { success: true };
  }, []);

  const getAccountBalance = useCallback(async () => {
    if (!connection?.is_active) return 0;
    // Mock balance for now
    return 50000 + Math.random() * 10000;
  }, [connection]);

  const getRecentTrades = useCallback(async () => {
    if (!connection?.is_active) return [];
    // Mock recent trades
    return Array.from({ length: 5 }, (_, i) => ({
      id: `trade-${i}`,
      strategy: `Strategy ${i + 1}`,
      symbol: ['SPY', 'QQQ', 'IWM', 'TLT', 'GLD'][i],
      side: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
      size: Math.floor(Math.random() * 10) + 1,
      price: 400 + Math.random() * 100,
      pnl: (Math.random() - 0.5) * 1000,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 30).toISOString(),
      status: Math.random() > 0.3 ? 'closed' : 'open' as 'open' | 'closed'
    }));
  }, [connection]);

  const getStrategies = useCallback(async () => {
    if (!connection?.is_active) return [];
    // Mock strategies
    return Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `Strategy ${i + 1}`,
      status: Math.random() > 0.5 ? 'active' : 'paused' as 'active' | 'paused' | 'stopped',
      pnl: (Math.random() - 0.5) * 5000,
      trades: Math.floor(Math.random() * 50),
      winRate: 50 + Math.random() * 30,
      drawdown: Math.random() * 10,
      isLive: false
    }));
  }, [connection]);

  const executeTrade = useCallback(async (strategy: any, parameters: any) => {
    if (!connection?.is_active) return null;
    // Mock trade execution
    return {
      id: `trade-${Date.now()}`,
      strategy: strategy.name,
      symbol: 'SPY',
      side: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
      size: parameters.maxPositionSize / 1000,
      price: 400 + Math.random() * 100,
      pnl: (Math.random() - 0.5) * 500,
      timestamp: new Date().toISOString(),
      status: 'open' as 'open' | 'closed'
    };
  }, [connection]);

  const getPositions = useCallback(async () => {
    if (!connection?.is_active) return [];
    // Mock positions
    return Array.from({ length: 3 }, (_, i) => ({
      id: `pos-${i}`,
      symbol: ['SPY', 'QQQ', 'IWM'][i],
      type: ['CALL', 'PUT', 'IRON_CONDOR'][i] as 'CALL' | 'PUT' | 'IRON_CONDOR' | 'BULL_SPREAD' | 'BEAR_SPREAD',
      contracts: Math.floor(Math.random() * 10) + 1,
      strike: 400 + Math.random() * 100,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      premium: Math.random() * 1000,
      currentValue: Math.random() * 1200,
      pnl: (Math.random() - 0.5) * 500,
      pnlPercent: (Math.random() - 0.5) * 20,
      status: 'OPEN' as 'OPEN' | 'CLOSED' | 'PENDING',
      openedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      direction: Math.random() > 0.5 ? 'LONG' : 'SHORT' as 'LONG' | 'SHORT',
      greeks: {
        delta: Math.random() - 0.5,
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.1,
        vega: Math.random() * 0.2
      }
    }));
  }, [connection]);

  const getTradeHistory = useCallback(async () => {
    if (!connection?.is_active) return { dailyPnL: [] };
    // Mock trade history
    const dailyPnL = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pnl: (Math.random() - 0.5) * 1000
    }));
    return { dailyPnL };
  }, [connection]);

  const getAvailableInstruments = useCallback(async () => {
    if (!connection?.is_active) return [];
    // Mock instruments
    return [
      { symbol: 'SPY', market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN', name: 'SPDR S&P 500 ETF' },
      { symbol: 'QQQ', market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN', name: 'Invesco QQQ Trust' },
      { symbol: 'IWM', market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN', name: 'iShares Russell 2000 ETF' },
      { symbol: 'TLT', market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN', name: 'iShares 20+ Year Treasury Bond ETF' },
      { symbol: 'GLD', market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN', name: 'SPDR Gold Shares' }
    ];
  }, [connection]);

  const openPosition = useCallback(async (position: any) => {
    if (!connection?.is_active) throw new Error('Not connected to broker');
    // Mock opening position
    return {
      id: `pos-${Date.now()}`,
      symbol: position.symbol,
      type: position.type,
      contracts: position.contracts,
      strike: position.strike,
      expiry: position.expiry,
      premium: Math.random() * 1000,
      currentValue: Math.random() * 1200,
      pnl: (Math.random() - 0.5) * 100,
      pnlPercent: (Math.random() - 0.5) * 5,
      status: 'OPEN' as 'OPEN' | 'CLOSED' | 'PENDING',
      openedAt: new Date().toISOString(),
      direction: position.direction,
      greeks: {
        delta: Math.random() - 0.5,
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.1,
        vega: Math.random() * 0.2
      }
    };
  }, [connection]);

  return {
    connectToBroker,
    fetchConnection,
    connection,
    isConnecting,
    isLoading,
    disconnectBroker,
    getAccountBalance,
    getRecentTrades,
    getStrategies,
    executeTrade,
    getPositions,
    getTradeHistory,
    getAvailableInstruments,
    openPosition,
  };
};
