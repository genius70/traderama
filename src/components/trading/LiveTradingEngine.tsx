import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Play, Pause, TrendingUp, DollarSign } from 'lucide-react';

interface TradingPosition {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  size: number;
  entry_price: number;
  current_pnl: number;
  status: 'open' | 'closed';
}

interface RiskParameters {
  maxPositionSize: number;
  dailyLossLimit: number;
  maxOpenPositions: number;
}

const LiveTradingEngine: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [riskParams] = useState<RiskParameters>({
    maxPositionSize: 5000,
    dailyLossLimit: 500,
    maxOpenPositions: 10
  });
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');

  const checkBrokerConnection = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ig_broker_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error checking broker connection:', error);
      setConnectionStatus('error');
    }
  }, [user]);

  const fetchPositions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('iron_condor_trades')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'executed']) // Fetch active positions
        .order('opened_at', { ascending: false });

      if (error) throw error;

      const formattedPositions: TradingPosition[] = data?.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        direction: 'SELL', // Iron condors are typically short positions
        size: trade.contracts,
        entry_price: trade.entry_price || 0,
        current_pnl: trade.current_pnl || 0,
        status: (trade.status === 'executed' || trade.status === 'pending') ? 'open' : 'closed'
      })) || [];

      setPositions(formattedPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  }, [user]);

  useEffect(() => {
    checkBrokerConnection();
    fetchPositions();
  }, [checkBrokerConnection, fetchPositions]);

  const toggleTrading = async () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Broker Not Connected",
        description: "Please connect your IG Broker account first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would call your trading engine API
      setIsActive(!isActive);
      
      toast({
        title: isActive ? "Trading Stopped" : "Trading Started",
        description: isActive ? "Auto-trading has been paused." : "Auto-trading is now active.",
      });
    } catch (error) {
      console.error('Error toggling trading:', error);
      toast({
        title: "Error",
        description: "Failed to toggle trading status.",
        variant: "destructive",
      });
    }
  };

  const handleExecuteTrade = async () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Broker Not Connected",
        description: "Please connect your IG Broker account first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would call your trading engine API
      setIsActive(!isActive);
      
      toast({
        title: isActive ? "Trading Stopped" : "Trading Started",
        description: isActive ? "Auto-trading has been paused." : "Auto-trading is now active.",
      });
    } catch (error) {
      console.error('Error toggling trading:', error);
      toast({
        title: "Error",
        description: "Failed to toggle trading status.",
        variant: "destructive",
      });
    }
  };

  const getRiskStatus = () => {
    const openPositions = positions.filter(p => p.status === 'open');
    const totalPnL = openPositions.reduce((sum, pos) => sum + pos.current_pnl, 0);
    
    if (totalPnL <= -riskParams.dailyLossLimit * 0.8) {
      return { status: 'high', message: 'Approaching daily loss limit' };
    }
    
    if (openPositions.length >= riskParams.maxOpenPositions * 0.8) {
      return { status: 'medium', message: 'High number of open positions' };
    }
    
    return { status: 'low', message: 'Risk within acceptable limits' };
  };

  const riskStatus = getRiskStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Live Trading Engine
          </span>
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {isActive ? (
              <Play className="h-8 w-8 text-green-600" />
            ) : (
              <Pause className="h-8 w-8 text-gray-400" />
            )}
            <div>
              <p className="font-medium">
                {isActive ? "Auto trading is active" : "Auto trading is paused"}
              </p>
              <p className="text-sm text-gray-500">
                {positions.filter(p => p.status === 'open').length} open positions
              </p>
            </div>
          </div>
          <Button
            onClick={toggleTrading}
            variant={isActive ? "destructive" : "default"}
            disabled={connectionStatus !== 'connected'}
          >
            {isActive ? "Stop Trading" : "Start Trading"}
          </Button>
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <h3 className="font-semibold">Risk Management</h3>
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            riskStatus.status === 'high' ? 'bg-red-50 text-red-700' :
            riskStatus.status === 'medium' ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{riskStatus.message}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Max Position Size</p>
              <p className="font-medium">${riskParams.maxPositionSize.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Daily Loss Limit</p>
              <p className="font-medium">${riskParams.dailyLossLimit}</p>
            </div>
            <div>
              <p className="text-gray-600">Max Open Positions</p>
              <p className="font-medium">{riskParams.maxOpenPositions}</p>
            </div>
          </div>
        </div>

        {/* Current Positions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Positions</h3>
          {positions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No open positions</p>
          ) : (
            <div className="space-y-2">
              {positions.slice(0, 5).map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{position.symbol}</span>
                    <Badge variant="outline">{position.direction}</Badge>
                    <span className="text-sm text-gray-600">{position.size} contracts</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span className={`font-medium ${
                        position.current_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.current_pnl >= 0 ? '+' : ''}${position.current_pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTradingEngine;
