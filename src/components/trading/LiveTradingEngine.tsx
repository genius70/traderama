import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TradingParameters {
  maxPositionSize: number;
  dailyLossLimit: number;
  maxTradePercentage: number;
  maxOpenPositions: number;
  stopLoss: number;
  takeProfit: number;
  riskPerTrade: number;
}

interface LiveTradingEngineProps {
  parameters: TradingParameters;
  isConnected: boolean;
  platformFee: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: Date;
  status: 'open' | 'closed' | 'pending';
  strategy: string;
}

interface EngineStatus {
  isRunning: boolean;
  totalPnL: number;
  dailyPnL: number;
  totalTrades: number;
  winRate: number;
  drawdown: number;
  fees: number;
  accountEquity: number;
}

const LiveTradingEngine: React.FC<LiveTradingEngineProps> = ({ 
  parameters, 
  isConnected, 
  platformFee 
}) => {
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    isRunning: false,
    totalPnL: 0,
    dailyPnL: 0,
    totalTrades: 0,
    winRate: 0,
    drawdown: 0,
    fees: 0,
    accountEquity: 25000
  });

  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [riskMetrics, setRiskMetrics] = useState({
    dailyLossUsed: 0,
    maxPositionUsed: 0,
    openPositions: 0,
    riskExposure: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tradeIdCounter = useRef(0);

  // Simulate real-time price updates and trading
  useEffect(() => {
    if (engineStatus.isRunning && isConnected) {
      intervalRef.current = setInterval(() => {
        updateTrades();
        checkForNewTrades();
        updateRiskMetrics();
      }, 2000); // Update every 2 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [engineStatus.isRunning, isConnected]);

  const updateTrades = () => {
    setActiveTrades(prev => 
      prev.map(trade => {
        // Simulate price movement
        const priceChange = (Math.random() - 0.5) * 0.02; // ±1% movement
        const newPrice = trade.currentPrice * (1 + priceChange);
        const pnl = (newPrice - trade.entryPrice) * trade.size * (trade.side === 'buy' ? 1 : -1);
        
        return {
          ...trade,
          currentPrice: newPrice,
          pnl: pnl
        };
      })
    );
  };

  const checkForNewTrades = () => {
    // Simulate trading signals (simplified)
    if (Math.random() > 0.95 && activeTrades.length < parameters.maxOpenPositions) {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const basePrice = 100 + Math.random() * 400; // Random price between 100-500
      const size = Math.min(
        Math.floor(parameters.maxPositionSize / basePrice),
        Math.floor(parameters.maxTradePercentage / 100 * engineStatus.accountEquity / basePrice)
      );

      if (size > 0) {
        executeTrade(symbol, side, size, basePrice);
      }
    }

    // Check for trade closures (stop loss/take profit)
    setActiveTrades(prev => 
      prev.filter(trade => {
        const pnlPercent = (trade.pnl / (trade.entryPrice * trade.size)) * 100;
        
        if (pnlPercent <= -parameters.stopLoss || pnlPercent >= parameters.takeProfit) {
          closeTrade(trade);
          return false;
        }
        return true;
      })
    );
  };

  const executeTrade = (symbol: string, side: 'buy' | 'sell', size: number, price: number) => {
    const newTrade: Trade = {
      id: `trade_${++tradeIdCounter.current}`,
      symbol,
      side,
      size,
      entryPrice: price,
      currentPrice: price,
      pnl: 0,
      timestamp: new Date(),
      status: 'open',
      strategy: 'Auto Strategy'
    };

    setActiveTrades(prev => [...prev, newTrade]);
    
    // Update metrics
    setEngineStatus(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1
    }));
  };

  const closeTrade = (trade: Trade) => {
    const platformFeeAmount = trade.pnl > 0 ? trade.pnl * platformFee : 0;
    const netPnL = trade.pnl - platformFeeAmount;

    setRecentTrades(prev => [
      { ...trade, status: 'closed' },
      ...prev.slice(0, 9) // Keep last 10 trades
    ]);

    // Update engine status
    setEngineStatus(prev => {
      const newTotalPnL = prev.totalPnL + netPnL;
      const newDailyPnL = prev.dailyPnL + netPnL;
      const newFees = prev.fees + platformFeeAmount;
      const newAccountEquity = prev.accountEquity + netPnL;

      return {
        ...prev,
        totalPnL: newTotalPnL,
        dailyPnL: newDailyPnL,
        fees: newFees,
        accountEquity: newAccountEquity,
        winRate: calculateWinRate([...recentTrades, trade])
      };
    });
  };

  const calculateWinRate = (trades: Trade[]): number => {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    return (winningTrades / trades.length) * 100;
  };

  const updateRiskMetrics = () => {
    const totalExposure = activeTrades.reduce((sum, trade) => 
      sum + (trade.currentPrice * trade.size), 0
    );
    
    const maxPosition = Math.max(...activeTrades.map(t => t.currentPrice * t.size), 0);
    
    setRiskMetrics({
      dailyLossUsed: Math.max(0, -engineStatus.dailyPnL),
      maxPositionUsed: maxPosition,
      openPositions: activeTrades.length,
      riskExposure: totalExposure
    });
  };

  const startEngine = () => {
    if (!isConnected) {
      alert('Please connect to IG Broker first');
      return;
    }
    setEngineStatus(prev => ({ ...prev, isRunning: true }));
  };

  const stopEngine = () => {
    setEngineStatus(prev => ({ ...prev, isRunning: false }));
    // Close all open positions
    setActiveTrades([]);
  };

  const pauseEngine = () => {
    setEngineStatus(prev => ({ ...prev, isRunning: false }));
  };

  const emergencyStop = () => {
    stopEngine();
    // Additional emergency protocols could be implemented here
  };

  const getRiskLevel = () => {
    const riskScore = 
      (riskMetrics.dailyLossUsed / parameters.dailyLossLimit) * 0.4 +
      (riskMetrics.openPositions / parameters.maxOpenPositions) * 0.3 +
      (riskMetrics.maxPositionUsed / parameters.maxPositionSize) * 0.3;

    if (riskScore < 0.3) return { level: 'Low', color: 'text-green-600' };
    if (riskScore < 0.7) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="space-y-6">
      {/* Engine Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Live Trading Engine
          </CardTitle>
          <CardDescription>
            Real-time automated trading with risk management
          </CardDescription>
        </CardHeader>
<CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge variant={engineStatus.isRunning ? "default" : "secondary"}>
                {engineStatus.isRunning ? "Running" : "Stopped"}
              </Badge>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={startEngine}
                disabled={engineStatus.isRunning || !isConnected}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              <Button 
                onClick={pauseEngine}
                disabled={!engineStatus.isRunning}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button 
                onClick={stopEngine}
                disabled={!engineStatus.isRunning}
                variant="outline"
                size="sm"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
              <Button 
                onClick={emergencyStop}
                variant="destructive"
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Emergency Stop
              </Button>
            </div>
          </div>

          {!isConnected && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connect to IG Broker to enable live trading
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total P&L</p>
                <p className={`text-2xl font-bold ${engineStatus.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${engineStatus.totalPnL.toFixed(2)}
                </p>
              </div>
              {engineStatus.totalPnL >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily P&L</p>
                <p className={`text-2xl font-bold ${engineStatus.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${engineStatus.dailyPnL.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {engineStatus.winRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account Equity</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${engineStatus.accountEquity.toLocaleString()}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Risk Management
          </CardTitle>
          <CardDescription>
            Current risk exposure and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge className={riskLevel.color}>
                {riskLevel.level}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Loss Limit</span>
                <span>${riskMetrics.dailyLossUsed.toFixed(2)} / ${parameters.dailyLossLimit}</span>
              </div>
              <Progress 
                value={(riskMetrics.dailyLossUsed / parameters.dailyLossLimit) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Max Position Size</span>
                <span>${riskMetrics.maxPositionUsed.toFixed(2)} / ${parameters.maxPositionSize}</span>
              </div>
              <Progress 
                value={(riskMetrics.maxPositionUsed / parameters.maxPositionSize) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Open Positions</span>
                <span>{riskMetrics.openPositions} / {parameters.maxOpenPositions}</span>
              </div>
              <Progress 
                value={(riskMetrics.openPositions / parameters.maxOpenPositions) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Active Trades</CardTitle>
          <CardDescription>
            Currently open positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrades.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No active trades</p>
          ) : (
            <div className="space-y-2">
              {activeTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                      {trade.side.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-sm text-gray-600">
                        {trade.size} shares @ ${trade.entryPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.pnl.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${trade.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>
            Last 10 completed trades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent trades</p>
          ) : (
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                      {trade.side.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-sm text-gray-600">
                        {trade.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${trade.pnl.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trade.size} shares
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Statistics</CardTitle>
          <CardDescription>
            Performance metrics and fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{engineStatus.totalTrades}</p>
              <p className="text-sm text-gray-600">Total Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{engineStatus.winRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">${engineStatus.fees.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Platform Fees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{engineStatus.drawdown.toFixed(2)}%</p>
              <p className="text-sm text-gray-600">Max Drawdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Demo component with default parameters
const TradingEngineDemo = () => {
  const defaultParameters: TradingParameters = {
    maxPositionSize: 10000,
    dailyLossLimit: 500,
    maxTradePercentage: 2,
    maxOpenPositions: 5,
    stopLoss: 2,
    takeProfit: 4,
    riskPerTrade: 1
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Live Trading Engine</h1>
        <LiveTradingEngine 
          parameters={defaultParameters}
          isConnected={true}
          platformFee={0.002}
        />
      </div>
    </div>
  );
};

export default TradingEngineDemo;
