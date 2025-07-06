import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Settings, TrendingUp, Link, DollarSign, Shield, Activity, Play, Pause } from 'lucide-react';
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
}

const AutoTrading = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([
    { id: 1, name: 'Iron Condor Weekly', status: 'active', pnl: 450.25, trades: 12, winRate: 75, drawdown: 2.5, isLive: false },
    { id: 2, name: 'Momentum Scalping', status: 'paused', pnl: -125.50, trades: 8, winRate: 62.5, drawdown: 5.2, isLive: false },
    { id: 3, name: 'Mean Reversion', status: 'active', pnl: 280.75, trades: 15, winRate: 80, drawdown: 1.8, isLive: false },
  ]);

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
  const [accountBalance, setAccountBalance] = useState(25000);
  const [platformFee] = useState(0.10); // 10% platform fee
  const [dailyPnL, setDailyPnL] = useState(125.75);
  const [monthlyFees, setMonthlyFees] = useState(340.50);

  const { 
    isConnected, 
    accountInfo, 
    connectionStatus, 
    connect, 
    disconnect,
    getAccountBalance,
    placeOrder,
    getPositions
  } = useIGBroker();

  useEffect(() => {
    if (isConnected) {
      // Fetch real account balance when connected
      getAccountBalance().then(balance => {
        if (balance) setAccountBalance(balance);
      });
    }
  }, [isConnected, getAccountBalance]);

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
          ? { ...strategy, status: newStatus }
          : strategy
      )
    );
  };

  const handleGoLive = async (strategyId: number) => {
    if (!isConnected) {
      alert('Please connect to your IG Broker account first');
      return;
    }

    setStrategies(prev => 
      prev.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, isLive: true, status: 'active' }
          : strategy
      )
    );

    // Initialize live trading for this strategy
    // This would integrate with your LiveTradingEngine component
  };

  const calculatePlatformFee = (profit: number) => {
    return profit > 0 ? profit * platformFee : 0;
  };

  const totalActivePnL = strategies
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.pnl, 0);

  const totalPlatformFees = calculatePlatformFee(totalActivePnL);

  return (
    <div className="space-y-6">
      <Header />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Trading</h1>
          <p className="text-gray-600">Live automated trading with IG Broker integration</p>
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

      {/* IG Broker Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            IG Broker Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              {isConnected && accountInfo && (
                <div className="text-sm text-gray-600">
                  Account: {accountInfo.accountId} | Balance: ${accountBalance.toLocaleString()}
                </div>
              )}
            </div>
            <IGBrokerConnect />
          </div>
          {!isConnected && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connect your IG Broker account to enable live auto trading
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Live Trading Engine */}
      <LiveTradingEngine 
        parameters={tradingParameters}
        isConnected={isConnected}
        platformFee={platformFee}
      />

      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Strategies</CardTitle>
          <CardDescription>
            Manage your automated trading strategies and go live
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
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                    {!strategy.isLive && (
                      <Button
                        onClick={() => handleGoLive(strategy.id)}
                        disabled={!isConnected}
                        variant="outline"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Go Live
                      </Button>
                    )}
                    {strategy.isLive && (
                      <Button
                        onClick={() => setStrategies(prev => 
                          prev.map(s => 
                            s.id === strategy.id 
                              ? { ...s, isLive: false, status: 'paused' }
                              : s
                          )
                        )}
                        variant="outline"
                        size="sm"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Live
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management Dashboard */}
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
              <p className="text-2xl font-bold">7/{tradingParameters.maxOpenPositions}</p>
              <p className="text-sm text-gray-500">Active positions</p>
            </div>
            <div className="space-y-2">
              <Label>Platform Fees</Label>
              <p className="text-2xl font-bold">${totalPlatformFees.toFixed(2)}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Risk Per Trade</Label>
              <p className="text-lg font-semibold">{tradingParameters.riskPerTrade}%</p>
            </div>
            <div className="space-y-2">
              <Label>Stop Loss</Label>
              <p className="text-lg font-semibold">{tradingParameters.stopLoss}%</p>
            </div>
            <div className="space-y-2">
              <Label>Take Profit</Label>
              <p className="text-lg font-semibold">{tradingParameters.takeProfit}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Trading Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Live Trading Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Live Strategies</Label>
              <p className="text-2xl font-bold">
                {strategies.filter(s => s.isLive).length}/{strategies.length}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Connection Status</Label>
              <p className="text-2xl font-bold">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          {strategies.some(s => s.isLive) && (
            <Alert className="mt-4">
              <Activity className="h-4 w-4" />
              <AlertDescription>
                You have {strategies.filter(s => s.isLive).length} strategies running live. 
                Platform fees of 10% apply to profitable trades only.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoTrading;
