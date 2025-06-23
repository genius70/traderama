import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Settings, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, XCircle, Activity, Bell, BarChart3, RefreshCw } from 'lucide-react';
import Header from "@/components/layout/Header";

// Types matching the copyTradingEngine.ts
interface TradingViewAlert {
  type: "BUY" | "SELL";
  symbol: string;
  size: number;
  orderType: "MARKET" | "LIMIT";
  level?: number;
  expiry: string;
  epic: string;
}

interface TradeOrder {
  epic: string;
  size: number;
  direction: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  level?: number;
  expiry: string;
}

interface CopyTradingSettings {
  enabled: boolean;
  riskMultiplier: number;
  maxPositionSize: number;
  allowedSymbols: string[];
  stopLossPercentage: number;
  takeProfitPercentage: number;
  tradingHours: {
    start: string;
    end: string;
  };
  maxDailyTrades: number;
  autoRebalance: boolean;
}

interface TradeResult {
  id: string;
  timestamp: Date;
  symbol: string;
  type: "BUY" | "SELL";
  size: number;
  price: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  pnl?: number;
  error?: string;
}

interface PortfolioStats {
  totalValue: number;
  dailyPnL: number;
  totalPnL: number;
  winRate: number;
  activePositions: number;
  totalTrades: number;
}

const CopyTrading: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<CopyTradingSettings>({
    enabled: false,
    riskMultiplier: 1.0,
    maxPositionSize: 10000,
    allowedSymbols: ['SPY', 'QQQ', 'AAPL', 'TSLA', 'MSFT'],
    stopLossPercentage: 2.0,
    takeProfitPercentage: 6.0,
    tradingHours: {
      start: '09:30',
      end: '16:00'
    },
    maxDailyTrades: 10,
    autoRebalance: true
  });
  
  const [recentTrades, setRecentTrades] = useState<TradeResult[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioStats>({
    totalValue: 50000,
    dailyPnL: 347.82,
    totalPnL: 2847.65,
    winRate: 68.4,
    activePositions: 5,
    totalTrades: 127
  });
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastAlert, setLastAlert] = useState<TradingViewAlert | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const alertCountRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Simulate WebSocket connection for TradingView alerts
  const connectToTradingView = useCallback(() => {
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setConnectionStatus('connected');
      addNotification('Connected to TradingView successfully');
      
      // Simulate periodic alerts
      const interval = setInterval(() => {
        if (isActive && settings.enabled) {
          simulateAlert();
        }
      }, 8000 + Math.random() * 12000); // Random interval between 8-20 seconds
      
      return () => clearInterval(interval);
    }, 2000);
  }, [isActive, settings.enabled]);

  // Simulate TradingView alert
  const simulateAlert = () => {
    const symbols = settings.allowedSymbols;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? "BUY" : "SELL";
    const size = Math.floor(Math.random() * 5) + 1;
    
    const alert: TradingViewAlert = {
      type,
      symbol,
      size,
      orderType: Math.random() > 0.7 ? "LIMIT" : "MARKET",
      level: Math.random() > 0.7 ? 520 + Math.random() * 100 : undefined,
      expiry: "2024-12-20",
      epic: `${symbol}.OPT.20DEC24.${Math.floor(520 + Math.random() * 100)}.${type === "BUY" ? "C" : "P"}`
    };
    
    setLastAlert(alert);
    handleAlert(alert);
  };

  // Handle incoming TradingView alert
  const handleAlert = async (alert: TradingViewAlert) => {
    if (!isActive || !settings.enabled) return;

    alertCountRef.current++;
    addNotification(`📊 New ${alert.type} signal for ${alert.symbol}`);

    // Check trading hours
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(settings.tradingHours.start.replace(':', ''));
    const endTime = parseInt(settings.tradingHours.end.replace(':', ''));
    
    if (currentTime < startTime || currentTime > endTime) {
      addNotification('⏰ Alert received outside trading hours');
      return;
    }

    // Check daily trade limit
    const todaysTrades = recentTrades.filter(trade => 
      trade.timestamp.toDateString() === now.toDateString()
    ).length;
    
    if (todaysTrades >= settings.maxDailyTrades) {
      addNotification('🚫 Daily trade limit reached');
      return;
    }

    // Apply risk multiplier
    const adjustedSize = Math.floor(alert.size * settings.riskMultiplier);
    const adjustedAlert = { ...alert, size: adjustedSize };

    // Simulate trade execution
    setTimeout(() => {
      executeTrade(adjustedAlert);
    }, 1000 + Math.random() * 2000);
  };

  // Execute trade via copyTradingEngine
  const executeTrade = (alert: TradingViewAlert) => {
    const isSuccess = Math.random() > 0.15; // 85% success rate
    const price = 520 + Math.random() * 100;
    const pnl = isSuccess ? (Math.random() - 0.45) * 500 : -Math.random() * 200;
    
    const trade: TradeResult = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      symbol: alert.symbol,
      type: alert.type,
      size: alert.size,
      price,
      status: isSuccess ? "SUCCESS" : "FAILED",
      pnl: isSuccess ? pnl : undefined,
      error: isSuccess ? undefined : "Order rejected by broker"
    };

    setRecentTrades(prev => [trade, ...prev.slice(0, 19)]);
    
    if (isSuccess) {
      addNotification(`✅ ${alert.type} ${alert.symbol} executed at $${price.toFixed(2)}`);
      updatePortfolio(pnl);
    } else {
      addNotification(`❌ Trade failed: ${trade.error}`);
    }
  };

  // Update portfolio stats
  const updatePortfolio = (pnl: number) => {
    setPortfolio(prev => ({
      ...prev,
      totalValue: prev.totalValue + pnl,
      dailyPnL: prev.dailyPnL + pnl,
      totalPnL: prev.totalPnL + pnl,
      totalTrades: prev.totalTrades + 1,
      winRate: pnl > 0 ? prev.winRate + 0.1 : prev.winRate - 0.1
    }));
  };

  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
  };

  // Toggle copy trading
  const toggleCopyTrading = () => {
    const newState = !isActive;
    setIsActive(newState);
    setSettings(prev => ({ ...prev, enabled: newState }));
    
    if (newState) {
      connectToTradingView();
      addNotification('🚀 Copy trading activated');
    } else {
      setConnectionStatus('disconnected');
      addNotification('⏹️ Copy trading deactivated');
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    if (isActive) {
      connectToTradingView();
    }
  }, [connectToTradingView, isActive]);

  // Update connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
 <div className="min-h-screen bg-gray-50">     
     <Header /> 
    </div>    
 <div className="min-h-screen bg-gray-900 text-white p-6">
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold">Copy Trading Manager</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
              <span className="text-sm text-gray-400 capitalize">{connectionStatus}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <button
              onClick={toggleCopyTrading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span>{isActive ? 'Stop Trading' : 'Start Trading'}</span>
            </button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Daily P&L</p>
                <p className={`text-2xl font-bold ${portfolio.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${portfolio.dailyPnL >= 0 ? '+' : ''}{portfolio.dailyPnL.toFixed(2)}
                </p>
              </div>
              {portfolio.dailyPnL >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400">{portfolio.winRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Positions</p>
                <p className="text-2xl font-bold text-purple-400">{portfolio.activePositions}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Trades
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTrades.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No trades yet. Start copy trading to see activity.</p>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {trade.status === 'SUCCESS' ? 
                        <CheckCircle className="h-5 w-5 text-green-400" /> :
                        <XCircle className="h-5 w-5 text-red-400" />
                      }
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            trade.type === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {trade.type}
                          </span>
                          <span className="font-semibold">{trade.symbol}</span>
                          <span className="text-gray-400">×{trade.size}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {trade.timestamp.toLocaleTimeString()} - ${trade.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {trade.pnl !== undefined && (
                        <p className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </p>
                      )}
                      {trade.error && (
                        <p className="text-xs text-red-400">{trade.error}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications & Last Alert */}
          <div className="space-y-6">
            {/* Last Alert */}
            {lastAlert && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Latest Signal
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Symbol:</span>
                    <span className="font-semibold">{lastAlert.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      lastAlert.type === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {lastAlert.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span>{lastAlert.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Order Type:</span>
                    <span>{lastAlert.orderType}</span>
                  </div>
                  {lastAlert.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span>${lastAlert.level}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-sm">No recent activity</p>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm">{notification}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Trading Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={settings.riskMultiplier}
                    onChange={(e) => setSettings(prev => ({ ...prev, riskMultiplier: parseFloat(e.target.value) }))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Position Size ($)</label>
                  <input
                    type="number"
                    value={settings.maxPositionSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxPositionSize: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.stopLossPercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, stopLossPercentage: parseFloat(e.target.value) }))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.takeProfitPercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, takeProfitPercentage: parseFloat(e.target.value) }))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Daily Trades</label>
                  <input
                    type="number"
                    value={settings.maxDailyTrades}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxDailyTrades: parseInt(e.target.value) }))}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Rebalance</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoRebalance: !prev.autoRebalance }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.autoRebalance ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                      settings.autoRebalance ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTrading;
