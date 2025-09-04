import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Settings, TrendingUp, Link, DollarSign, Shield, CheckCircle, Play, Pause, Power } from 'lucide-react';
import { LiveTradingEngine } from '@/components/trading';
import { IGBrokerConnect } from '@/components/brokers';
import Header from '@/components/layout/Header';
import { useIGBroker } from '@/hooks/useIGBroker';

interface TradingParameters {
  maxPositionSize: number;
  dailyLossLimit: number;
  maxTradePercentage: number;
  maxOpenPositions: number;
  stopLoss: number;
  takeProfit: number;
  riskPerTrade: number;
}

interface Strategy {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  pnl: number;
  trades: number;
  winRate: number;
  drawdown: number;
  isLive: boolean;
  lastTrade?: string;
}

interface Trade {
  id: string;
  strategy: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  pnl: number;
  timestamp: string;
  status: 'open' | 'closed';
}

const AutoTrading = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [tradingParameters, setTradingParameters] = useState<TradingParameters>({
    maxPositionSize: 5000,
    dailyLossLimit: 500,
    maxTradePercentage: 2,
    maxOpenPositions: 10,
    stopLoss: 5,
    takeProfit: 10,
    riskPerTrade: 1
  });
  const [showParametersDialog, setShowParametersDialog] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [platformFee] = useState(0.10);
  const [dailyPnL, setDailyPnL] = useState(0);
  const [monthlyFees, setMonthlyFees] = useState(0);
  const [isTradingActive, setIsTradingActive] = useState(false);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [tradingEngine, setTradingEngine] = useState<NodeJS.Timeout | null>(null);

  const {
    connectToBroker,
    fetchConnection,
    connection,
    isConnecting: brokerConnecting,
    isLoading,
    disconnectBroker,
    getAccountBalance,
    getRecentTrades,
    getStrategies,
    executeTrade
  } = useIGBroker();

  const isConnected = connection?.is_active || false;
  const connectionStatus = isConnected ? 'connected' : 'disconnected';

  // Fetch initial data on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchConnection();
        if (isConnected) {
          const balance = await getAccountBalance();
          const trades = await getRecentTrades();
          const strategyData = await getStrategies();
          
          setAccountBalance(balance);
          setRecentTrades(trades);
          setStrategies(strategyData);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    initialize();
  }, [isConnected, fetchConnection, getAccountBalance, getRecentTrades, getStrategies]);

  const handleConnectBroker = async (credentials: {
    username: string;
    password: string;
    apiKey: string;
    accountId: string;
  }) => {
    try {
      const result = await connectToBroker(credentials);
      if (result.success) {
        const balance = await getAccountBalance();
        setAccountBalance(balance);
        const strategyData = await getStrategies();
        setStrategies(strategyData);
        console.log('Broker connection successful');
      } else {
        throw new Error('Broker connection failed');
      }
    } catch (error) {
      console.error('Broker connection failed:', error);
      alert('Failed to connect to broker. Please check your credentials.');
    }
  };

  const handleDisconnect = async () => {
    setIsTradingActive(false);
    if (tradingEngine) {
      clearInterval(tradingEngine);
      setTradingEngine(null);
    }
    try {
      await disconnectBroker();
      setAccountBalance(0);
      setStrategies([]);
      setRecentTrades([]);
    } catch (error) {
      console.error('Broker disconnection failed:', error);
    }
  };

  const handleStartTrading = async () => {
    if (!isConnected) {
      alert('Please connect to your broker account first');
      return;
    }

    const activeStrategies = strategies.filter(s => s.status === 'active');
    if (activeStrategies.length === 0) {
      alert('Please activate at least one strategy before starting trading');
      return;
    }

    try {
      setIsTradingActive(true);
      setStrategies(prev =>
        prev.map(strategy => ({
          ...strategy,
          isLive: strategy.status === 'active'
        }))
      );

      const engine = setInterval(async () => {
        try {
          for (const strategy of activeStrategies) {
            const trade = await executeTrade(strategy, tradingParameters);
            if (trade) {
              setRecentTrades(prev => [trade, ...prev.slice(0, 9)]);
              setStrategies(prev =>
                prev.map(s => {
                  if (s.id === strategy.id) {
                    return {
                      ...s,
                      trades: s.trades + 1,
                      pnl: s.pnl + trade.pnl,
                      winRate: trade.pnl > 0
                        ? Math.min(95, s.winRate + 1)
                        : Math.max(50, s.winRate - 1),
                      lastTrade: trade.timestamp,
                      isLive: true
                    };
                  }
                  return s;
                })
              );
              setDailyPnL(prev => prev + trade.pnl);
            }
          }
        } catch (error) {
          console.error('Trade execution failed:', error);
        }
      }, 5000);

      setTradingEngine(engine);
      console.log('Trading engine started successfully');
      return {
        success: true,
        message: 'Trading engine started',
        activeStrategies: activeStrategies.length
      };
    } catch (error) {
      console.error('Failed to start trading:', error);
      setIsTradingActive(false);
      return { success: false, message: 'Failed to start trading' };
    }
  };

  const handleStopTrading = async () => {
    try {
      setIsTradingActive(false);
      if (tradingEngine) {
        clearInterval(tradingEngine);
        setTradingEngine(null);
      }
      setStrategies(prev =>
        prev.map(strategy => ({
          ...strategy,
          isLive: false,
          status: 'paused'
        }))
      );
      console.log('Trading engine stopped');
    } catch (error) {
      console.error('Failed to stop trading:', error);
    }
  };

  const handleParameterChange = (param: keyof TradingParameters, value: number) => {
    setTradingParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleStrategyToggle = (strategyId: number, newStatus: 'active' | 'paused') => {
    setStrategies(prev =>
      prev.map(strategy =>
        strategy.id === strategyId
          ? { ...strategy, status: newStatus, isLive: newStatus === 'active' && isTradingActive }
          : strategy
      )
    );
  };

  const calculatePlatformFee = (profit: number) => {
    return profit > 0 ? profit * platformFee : 0;
  };

  const totalActivePnL = strategies
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.pnl, 0);

  const totalPlatformFees = calculatePlatformFee(totalActivePnL);

  useEffect(() => {
    return () => {
      if (tradingEngine) {
        clearInterval(tradingEngine);
      }
    };
  }, [tradingEngine]);

  return (
    <div className="space-y-6">
      <Header />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Trading Platform</h1>
          <p className="text-gray-600">Live automated trading with broker integration</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Platform Fee Structure</DialogTitle>
                <DialogDescription>
                  Transparent pricing for automated trading services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Performance Fee</h3>
                  <p className="text-blue-700">10% of profitable trades only</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Month P&L:</span>
                    <span className="font-semibold">${totalActivePnL.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (10%):</span>
                    <span className="font-semibold">${totalPlatformFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Fees Paid:</span>
                    <span className="font-semibold">${monthlyFees.toFixed(2)}</span>
                  </div>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Fees are only charged on profitable trades. No fees on losses.
                  </AlertDescription>
                </Alert>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showParametersDialog} onOpenChange={setShowParametersDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Parameters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Trading Parameters</DialogTitle>
                <DialogDescription>
                  Configure your risk management and trading limits
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Position Size ($)</Label>
                  <Input
                    type="number"
                    value={tradingParameters.maxPositionSize}
                    onChange={(e) => handleParameterChange('maxPositionSize', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Loss Limit ($)</Label>
                  <Input
                    type="number"
                    value={tradingParameters.dailyLossLimit}
                    onChange={(e) => handleParameterChange('dailyLossLimit', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Trade Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tradingParameters.maxTradePercentage}
                    onChange={(e) => handleParameterChange('maxTradePercentage', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Open Positions</Label>
                  <Input
                    type="number"
                    value={tradingParameters.maxOpenPositions}
                    onChange={(e) => handleParameterChange('maxOpenPositions', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stop Loss (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tradingParameters.stopLoss}
                    onChange={(e) => handleParameterChange('stopLoss', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Take Profit (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tradingParameters.takeProfit}
                    onChange={(e) => handleParameterChange('takeProfit', Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={() => setShowParametersDialog(false)}>
                Save Parameters
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Power className="h-5 w-5 mr-2" />
              Trading Engine Control
            </div>
            <Badge variant={isTradingActive ? "default" : "secondary"} className="text-sm">
              {isTradingActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Broker: {isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {isConnected && (
                <div className="text-sm text-gray-600">
                  Balance: ${accountBalance.toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {!isConnected ? (
                <IGBrokerConnect onConnect={handleConnectBroker} />
              ) : (
                <Button onClick={handleDisconnect} variant="outline">
                  <Link className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
              
              {!isTradingActive ? (
                <Button 
                  onClick={handleStartTrading} 
                  disabled={!isConnected}
                  className="bg-green-600 hover:bg-blue-600 text-white transition-colors duration-200"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Trading
                </Button>
              ) : (
                <Button 
                  onClick={handleStopTrading}
                  variant="destructive"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Trading
                </Button>
              )}
            </div>
          </div>
          
          {isTradingActive && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Auto trading is active! Strategies are executing trades automatically.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {recentTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                      {trade.side.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                    <span className="text-sm text-gray-600">{trade.strategy}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{trade.size} units @ {trade.price.toFixed(4)}</span>
                    <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">{trade.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Trading Strategies</CardTitle>
          <CardDescription>
            Manage your automated trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={strategy.status === 'active'} 
                        onCheckedChange={(checked) => 
                          handleStrategyToggle(strategy.id, checked ? 'active' : 'paused')
                        }
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{strategy.name}</p>
                          {strategy.isLive && <Badge variant="destructive">LIVE</Badge>}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                            {strategy.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {strategy.trades} trades | {strategy.winRate}% win rate
                          </span>
                          {strategy.lastTrade && (
                            <span className="text-sm text-gray-500">
                              Last: {strategy.lastTrade}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className={`font-medium ${
                        strategy.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {strategy.pnl >= 0 ? '+' : ''}${strategy.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Fee: ${calculatePlatformFee(strategy.pnl).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Drawdown:</span>
                    <span className="ml-2 font-medium">{strategy.drawdown}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">{strategy.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mode:</span>
                    <span className="ml-2 font-medium">{strategy.isLive ? 'Live' : 'Paper'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Active:</span>
                    <span className="ml-2 font-medium">{isTradingActive && strategy.status === 'active' ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Daily P&L</Label>
              <p className={`text-2xl font-bold ${dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Limit: ${tradingParameters.dailyLossLimit}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Max Position Size</Label>
              <p className="text-2xl font-bold">${tradingParameters.maxPositionSize.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Per trade</p>
            </div>
            <div className="space-y-2">
              <Label>Open Positions</Label>
              <p className="text-2xl font-bold">{recentTrades.filter(t => t.status === 'open').length}/{tradingParameters.maxOpenPositions}</p>
              <p className="text-sm text-gray-500">Active positions</p>
            </div>
            <div className="space-y-2">
              <Label>Platform Fees</Label>
              <p className="text-2xl font-bold">${totalPlatformFees.toFixed(2)}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoTrading;
