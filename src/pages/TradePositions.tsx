import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Target, 
  AlertTriangle, RefreshCcw, Settings, Play, 
  Pause, Wifi, WifiOff, Link, CheckCircle, XCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';
import Header from '@/components/layout/Header';

// Interfaces
interface Position {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT' | 'IRON_CONDOR' | 'BULL_SPREAD' | 'BEAR_SPREAD';
  contracts: number;
  strike: number;
  expiry: string;
  premium: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  openedAt: string;
  direction: 'LONG' | 'SHORT';
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  closedAt?: string;
}

interface BrokerSettings {
  identifier: string;
  isDemo: boolean;
  connected: boolean;
  autoSync: boolean;
}

interface Analytics {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  riskReward: number;
  maxDrawdown: number;
  riskPerTrade: number;
  sharpeRatio: number;
  profitFactor: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  bestDay: number;
  worstDay: number;
  avgDailyPnL: number;
}

const TradePositions: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [autoTrading, setAutoTrading] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [openPositions, setOpenPositions] = useState(0);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [selectedTradingOptions, setSelectedTradingOptions] = useState<string[]>([]);
  const [brokerSettings, setBrokerSettings] = useState<BrokerSettings>({
    identifier: '',
    isDemo: true,
    connected: false,
    autoSync: true,
  });

  // Dynamic analytics calculated from positions
  const calculateAnalytics = useCallback((): Analytics => {
    const totalTrades = positions.length;
    const winningTrades = positions.filter(p => p.pnl > 0).length;
    const losingTrades = positions.filter(p => p.pnl < 0).length;
    const breakEvenTrades = positions.filter(p => p.pnl === 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgWin = winningTrades > 0 ? positions.filter(p => p.pnl > 0).reduce((sum, p) => sum + p.pnl, 0) / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? positions.filter(p => p.pnl < 0).reduce((sum, p) => sum + p.pnl, 0) / losingTrades : 0;
    const riskReward = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const maxDrawdown = positions.length > 0 ? Math.min(...positions.map(p => p.pnl)) : 0;
    const bestDay = positions.length > 0 ? Math.max(...positions.map(p => p.pnl)) : 0;
    const worstDay = maxDrawdown;

    return {
      totalTrades,
      winRate,
      avgWin,
      avgLoss,
      riskReward,
      maxDrawdown,
      riskPerTrade: 2.0, // Placeholder: Calculate from actual risk settings
      sharpeRatio: 1.5, // Placeholder: Requires historical returns and volatility
      profitFactor: avgWin > 0 ? avgWin / Math.abs(avgLoss) : 0,
      winningTrades,
      losingTrades,
      breakEvenTrades,
      bestDay,
      worstDay,
      avgDailyPnL: positions.length > 0 ? positions.reduce((sum, p) => sum + p.pnl, 0) / 30 : 0, // Simplified
    };
  }, [positions]);

  const [analytics, setAnalytics] = useState<Analytics>(calculateAnalytics());

  // Placeholder for real-time daily PnL data
  const [dailyPnL, setDailyPnL] = useState<{ date: string; pnl: number }[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<{ month: string; profit: number; loss: number }[]>([]);

  // Fetch real-time positions from broker API
  const fetchPositions = useCallback(async () => {
    if (!brokerConnected || !user) {
      setLoading(false);
      return;
    }

    try {
      // Replace with actual broker API call
      const response = await fetch('/api/broker/positions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`, // Secure token handling
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch positions');

      const data: Position[] = await response.json();
      
      // Sync with Supabase
      const { error } = await supabase
        .from('positions')
        .upsert(data.map(pos => ({
          ...pos,
          user_id: user.id,
        })));
      
      if (error) {
        throw new Error('Failed to save positions to database');
      }

      setPositions(data);
      setOpenPositions(data.filter(p => p.status === 'OPEN').length);
      setTotalPnL(data.reduce((sum, pos) => sum + pos.pnl, 0));
      setAccountBalance(await fetchAccountBalance()); // Separate API call
      setAnalytics(calculateAnalytics());
      
      // Fetch performance data
      await fetchPerformanceData();
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [brokerConnected, user, toast, calculateAnalytics]);

  // Fetch account balance
  const fetchAccountBalance = async (): Promise<number> => {
    try {
      const response = await fetch('/api/broker/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch account balance');
      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  };

  // Fetch performance data for charts
  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/broker/performance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch performance data');
      const data = await response.json();
      setDailyPnL(data.dailyPnL || []);
      setMonthlyPerformance(data.monthlyPerformance || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setDailyPnL([]);
      setMonthlyPerformance([]);
    }
  };

  // Auto-trading execution
  const executeAutoTrade = useCallback(async () => {
    if (!brokerConnected || !autoTrading || !selectedTradingOptions.length) return;

    try {
      const response = await fetch('/api/broker/auto-trade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: selectedTradingOptions }),
      });

      if (!response.ok) throw new Error('Failed to execute auto trade');

      const { positions: newAldi, newPositions } = await response.json();
      
      if (newPositions.length > 0) {
        const { error } = await supabase
          .from('positions')
          .upsert(newPositions.map(pos => ({
            ...pos,
            user_id: user.id,
          })));
        
        if (error) {
          throw new Error('Failed to save auto trade positions');
        }

        setPositions(prev => [...prev, ...newPositions]);
        toast({
          title: "Auto Trade Executed",
          description: `Successfully executed ${newPositions.length} new positions`,
        });
        
        await fetchPositions();
      }
    } catch (error) {
      console.error('Auto trading error:', error);
      toast({
        title: "Auto Trading Error",
        description: "Failed to execute automated trades",
        variant: "destructive",
      });
    }
  }, [brokerConnected, autoTrading, selectedTradingOptions, user, toast]);

  // Real-time position updates via WebSocket
  useEffect(() => {
    if (!brokerConnected) return;

    const ws = new WebSocket('wss://broker-api.example.com/positions');
    ws.onmessage = (event) => {
      const updatedPositions = JSON.parse(event.data);
      setPositions(updatedPositions);
      setOpenPositions(updatedPositions.filter(p => p.status === 'OPEN').length);
      setTotalPnL(updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0));
      setAnalytics(calculateAnalytics());
    };

    ws.onerror = () => {
      toast({
        title: "WebSocket Error",
        description: "Failed to update positions in real-time",
        variant: "destructive",
      });
    };

    return () => ws.close();
  }, [brokerConnected, toast, calculateAnalytics]);

  useEffect(() => {
    if (user) {
      fetchPositions();
    }
  }, [user, fetchPositions]);

  useEffect(() => {
    if (autoTrading) {
      const interval = setInterval(executeAutoTrade, 60000);
      return () => clearInterval(interval);
    }
  }, [autoTrading, executeAutoTrade]);

  // Broker connection
  const handleConnectBroker = async () => {
    try {
      if (!brokerSettings.identifier) {
        toast({
          title: "Error",
          description: "Please fill in the account identifier",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const response = await fetch('/api/broker/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: brokerSettings.identifier, isDemo: brokerSettings.isDemo }),
      });

      if (!response.ok) throw new Error('Failed to connect to broker');

      if (user) {
        const { error } = await supabase
          .from('broker_settings')
          .upsert({
            user_id: user.id,
            identifier: brokerSettings.identifier,
            isDemo: brokerSettings.isDemo,
            connected: true,
            autoSync: brokerSettings.autoSync,
          });
        
        if (error) {
          throw new Error('Failed to save broker settings');
        }
      }

      setBrokerSettings(prev => ({ ...prev, connected: true }));
      setBrokerConnected(true);
      setBrokerModalOpen(false);
      toast({
        title: "Success",
        description: "Successfully connected to IG Broker",
      });
      
      await fetchPositions();
    } catch (error) {
      console.error('Error connecting to broker:', error);
      toast({
        title: "Error",
        description: "Failed to connect to broker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectBroker = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('broker_settings')
          .update({ connected: false })
          .eq('user_id', user.id);
        
        if (error) {
          throw new Error('Error updating broker settings');
        }
      }

      setBrokerSettings(prev => ({ ...prev, connected: false }));
      setBrokerConnected(false);
      setPositions([]);
      setOpenPositions(0);
      setTotalPnL(0);
      setAccountBalance(0);
      setAutoTrading(false);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from IG Broker",
      });
    } catch (error) {
      console.error('Error disconnecting from broker:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from broker",
        variant: "destructive",
      });
    }
  };

  const handleClosePosition = async (positionId: string) => {
    if (!brokerConnected) return;

    try {
      const response = await fetch('/api/broker/close-position', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positionId }),
      });

      if (!response.ok) throw new Error('Failed to close position');

      if (user) {
        const { error } = await supabase
          .from('positions')
          .update({ status: 'CLOSED', closedAt: new Date().toISOString() })
          .eq('id', positionId)
          .eq('user_id', user.id);
        
        if (error) {
          throw new Error('Error updating position');
        }
      }
      
      await fetchPositions();
      toast({
        title: "Position Closed",
        description: "Position has been successfully closed",
      });
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive",
      });
    }
  };

  const toggleAutoTrading = () => {
    if (!brokerConnected) {
      toast({
        title: "Error",
        description: "Please connect to your broker first",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTradingOptions.length) {
      toast({
        title: "Error",
        description: "Please select trading options before enabling auto trading",
        variant: "destructive",
      });
      return;
    }

    setAutoTrading(prev => {
      const newState = !prev;
      toast({
        title: newState ? "Auto Trading Started" : "Auto Trading Stopped",
        description: newState ? "Automated trading is now active" : "Manual trading mode activated",
      });
      
      if (newState) {
        executeAutoTrade();
      }
      
      return newState;
    });
  };

  const getPositionStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <RefreshCcw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading positions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trade Positions</h1>
            <p className="text-gray-600">Monitor and manage your active trading positions</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {brokerConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {brokerConnected ? 'Connected to IG Broker' : 'Not Connected'}
              </span>
            </div>
            <Button variant="outline" onClick={fetchPositions} disabled={!brokerConnected}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {!brokerConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to connect to your IG Broker account to view and manage positions.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trading Configuration</CardTitle>
            <CardDescription>
              Select your preferred trading options and strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TradingOptionsSelector
              selectedOptions={selectedTradingOptions}
              onOptionsChange={setSelectedTradingOptions}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {brokerConnected ? `$${accountBalance.toLocaleString()}` : '$0'}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {brokerConnected ? 'Live Data' : 'Connect to view'}
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {brokerConnected ? `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}` : '$0.00'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-3 w-3 mr-1" />
                Unrealized
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openPositions}</div>
              <div className="flex items-center text-sm text-gray-600">
                <Target className="h-3 w-3 mr-1" />
                Active trades
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Auto Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleAutoTrading}
                variant={autoTrading ? "destructive" : "default"}
                className="w-full"
                disabled={!brokerConnected}
              >
                {autoTrading ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Auto
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Auto
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="broker">Connect to Broker</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>
                  Currently open and pending trading positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!brokerConnected ? (
                  <div className="text-center py-8 text-gray-500">
                    <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Connect to your IG Broker account to view positions</p>
                    <Dialog open={brokerModalOpen} onOpenChange={setBrokerModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="mt-4">
                          <Link className="h-4 w-4 mr-2" />
                          Connect to Broker
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect to IG Broker</DialogTitle>
                          <DialogDescription>
                            Enter your broker account details to connect
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="identifier">Account Identifier</Label>
                            <Input
                              id="identifier"
                              value={brokerSettings.identifier}
                              onChange={(e) =>
                                setBrokerSettings({ ...brokerSettings, identifier: e.target.value })
                              }
                              placeholder="Enter account identifier"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="demo-mode"
                              checked={brokerSettings.isDemo}
                              onCheckedChange={(checked) =>
                                setBrokerSettings({ ...brokerSettings, isDemo: checked })
                              }
                            />
                            <Label htmlFor="demo-mode">Demo Mode</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="auto-sync"
                              checked={brokerSettings.autoSync}
                              onCheckedChange={(checked) =>
                                setBrokerSettings({ ...brokerSettings, autoSync: checked })
                              }
                            />
                            <Label htmlFor="auto-sync">Auto Sync Positions</Label>
                          </div>
                          <Button onClick={handleConnectBroker} disabled={loading}>
                            {loading ? 'Connecting...' : 'Connect'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : positions.filter(pos => pos.status !== 'CLOSED').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active positions</p>
                    <p className="text-sm">Your open trades will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.filter(pos => pos.status !== 'CLOSED').map((position) => (
                      <div key={position.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getPositionStatusIcon(position.status)}
                              <h3 className="font-semibold text-lg">{position.symbol}</h3>
                            </div>
                            <Badge variant="outline">{position.type}</Badge>
                            <Badge variant="secondary">{position.direction}</Badge>
                            <Badge variant={position.pnl >= 0 ? 'default' : 'destructive'}>
                              {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            {position.status === 'OPEN' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleClosePosition(position.id)}
                              >
                                Close Position
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Contracts</p>
                            <p className="font-medium">{position.contracts}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Strike</p>
                            <p className="font-medium">${position.strike}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Expiry</p>
                            <p className="font-medium">{new Date(position.expiry).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Premium</p>
                            <p className="font-medium">${position.premium}</p>
                          </div>
                        </div>

                        {position.greeks && (
                          <div className="grid grid-cols-4 gap-4 text-sm mb-4 p-3 bg-gray-50 rounded">
                            <div>
                              <p className="text-gray-600">Delta</p>
                              <p className="font-medium">{position.greeks.delta.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Gamma</p>
                              <p className="font-medium">{position.greeks.gamma.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Theta</p>
                              <p className="font-medium">{position.greeks.theta.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Vega</p>
                              <p className="font-medium">{position.greeks.vega.toFixed(1)}</p>
                            </div>
                          </div>
                        )}

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Opened: {new Date(position.openedAt).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            Current Value: <span className="font-medium">${position.currentValue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Your closed trading positions</CardDescription>
              </CardHeader>
              <CardContent>
                {!brokerConnected ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Connect to your broker to view trade history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positions.filter(pos => pos.status === 'CLOSED').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No closed positions to display</p>
                      </div>
                    ) : (
                      positions.filter(pos => pos.status === 'CLOSED').map((position) => (
                        <div key={position.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getPositionStatusIcon(position.status)}
                                <h3 className="font-semibold text-lg">{position.symbol}</h3>
                              </div>
                              <Badge variant="outline">{position.type}</Badge>
                              <Badge variant="secondary">{position.direction}</Badge>
                              <Badge variant={position.pnl >= 0 ? 'default' : 'destructive'}>
                                {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Contracts</p>
                              <p className="font-medium">{position.contracts}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Strike</p>
                              <p className="font-medium">${position.strike}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Expiry</p>
                              <p className="font-medium">{new Date(position.expiry).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Premium</p>
                              <p className="font-medium">${position.premium}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                Opened: {new Date(position.openedAt).toLocaleString()}
                              </span>
                              <span className="text-gray-600">
                                Closed: {position.closedAt ? new Date(position.closedAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and risk analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!brokerConnected ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Connect to your broker to view analytics</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {analytics.winRate.toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">
                            {analytics.winningTrades} of {analytics.totalTrades} trades
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Best Trade</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            ${analytics.bestDay.toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-600">Single trade profit</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Worst Trade</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            ${analytics.worstDay.toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-600">Single trade loss</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Daily P&L</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyPnL.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyPnL}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="pnl" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-center text-gray-500">No daily P&L data available</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Portfolio Greeks</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Delta:</span>
                                <span className="font-medium">
                                  {positions.reduce((sum, p) => sum + (p.greeks?.delta || 0), 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Gamma:</span>
                                <span className="font-medium">
                                  {positions.reduce((sum, p) => sum + (p.greeks?.gamma || 0), 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Theta:</span>
                                <span className="font-medium">
                                  {positions.reduce((sum, p) => sum + (p.greeks?.theta || 0), 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Position Sizing</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Average Position Size:</span>
                                <span className="font-medium">
                                  {positions.length > 0 ?
                                    `$${(positions.reduce((sum, p) => sum + p.currentValue, 0) / positions.length).toFixed(2)}` : '$0.00'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Largest Position:</span>
                                <span className="font-medium">
                                  {positions.length > 0 ?
                                    `$${Math.max(...positions.map(p => p.currentValue)).toFixed(2)}` : '$0.00'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Portfolio Concentration:</span>
                                <span className="font-medium">
                                  {positions.length > 0 ?
                                    `${((Math.max(...positions.map(p => p.currentValue)) / 
                                    positions.reduce((sum, p) => sum + p.currentValue, 0)) * 100).toFixed(1)}%` : '0%'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broker">
            <Card>
              <CardHeader>
                <CardTitle>Broker Connection</CardTitle>
                <CardDescription>
                  Connect to your IG Broker account to start trading
                </CardDescription>
              </CardHeader>
              <CardContent>
                {brokerConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-green-600">
                      <Wifi className="h-5 w-5" />
                      <span className="font-medium">Connected to IG Broker</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Account Details</h4>
                        <div className="space-y-1 text-sm">
                          <p>Account ID: {brokerSettings.identifier}</p>
                          <p>Account Type: {brokerSettings.isDemo ? 'Demo' : 'Live'}</p>
                          <p>Currency: USD</p>
                          <p>Status: Active</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Connection Status</h4>
                        <div className="space-y-1 text-sm">
                          <p>Connected: {new Date().toLocaleString()}</p>
                          <p>API Version: v3.0</p>
                          <p>Market Data: Live</p>
                          <p>Trading: Enabled</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleDisconnectBroker}
                      className="w-full md:w-auto"
                    >
                      <WifiOff className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Link className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="font-semibold mb-2">Connect to IG Broker</h3>
                      <p className="text-gray-600 mb-4">
                        Connect your IG Broker account to start trading and view your positions
                      </p>
                      <Dialog open={brokerModalOpen} onOpenChange={setBrokerModalOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Link className="h-4 w-4 mr-2" />
                            Connect Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Connect to IG Broker</DialogTitle>
                            <DialogDescription>
                              Enter your broker account details to connect
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="identifier">Account Identifier</Label>
                              <Input
                                id="identifier"
                                value={brokerSettings.identifier}
                                onChange={(e) =>
                                  setBrokerSettings({ ...brokerSettings, identifier: e.target.value })
                                }
                                placeholder="Enter account identifier"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="demo-mode"
                                checked={brokerSettings.isDemo}
                                onCheckedChange={(checked) =>
                                  setBrokerSettings({ ...brokerSettings, isDemo: checked })
                                }
                              />
                              <Label htmlFor="demo-mode">Demo Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="auto-sync"
                                checked={brokerSettings.autoSync}
                                onCheckedChange={(checked) =>
                                  setBrokerSettings({ ...brokerSettings, autoSync: checked })
                                }
                              />
                              <Label htmlFor="auto-sync">Auto Sync Positions</Label>
                            </div>
                            <Button onClick={handleConnectBroker} disabled={loading}>
                              {loading ? 'Connecting...' : 'Connect'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Connection Requirements</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Valid IG Broker account</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>API access enabled</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Account credentials and API key</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradePositions;
