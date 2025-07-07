import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  RefreshCcw, 
  Settings, 
  Play, 
  Pause, 
  Wifi, 
  WifiOff,
  Eye,
  EyeOff,
  Link,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';
import Header from '@/components/layout/Header';

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
}

interface BrokerSettings {
  apiKey: string;
  identifier: string;
  password: string;
  isDemo: boolean;
  connected: boolean;
  autoSync: boolean;
}

const TradePositions = () => {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedTradingOptions, setSelectedTradingOptions] = useState([]);
  const [brokerSettings, setBrokerSettings] = useState<BrokerSettings>({
    apiKey: '',
    identifier: '',
    password: '',
    isDemo: true,
    connected: false,
    autoSync: true
  });

  const [dailyPnL] = useState([
    { date: '2024-01-01', pnl: 450 },
    { date: '2024-01-02', pnl: -200 },
    { date: '2024-01-03', pnl: 800 },
    { date: '2024-01-04', pnl: 320 },
    { date: '2024-01-05', pnl: -150 },
    { date: '2024-01-06', pnl: 600 },
    { date: '2024-01-07', pnl: 920 }
  ]);

  const fetchPositions = useCallback(async () => {
    if (!brokerConnected) {
      setLoading(false);
      return;
    }

    try {
      // Mock positions data - in real app, this would come from IG Broker API
      const mockPositions: Position[] = [
        {
          id: '1',
          symbol: 'SPY',
          type: 'IRON_CONDOR',
          contracts: 10,
          strike: 420,
          expiry: '2024-01-19',
          premium: 2000,
          currentValue: 1800,
          pnl: 200,
          pnlPercent: 10,
          status: 'OPEN',
          direction: 'SHORT',
          openedAt: '2024-01-10T10:00:00Z',
          greeks: { delta: -0.05, gamma: 0.02, theta: -15.5, vega: 8.2 }
        },
        {
          id: '2',
          symbol: 'QQQ',
          type: 'CALL',
          contracts: 5,
          strike: 370,
          expiry: '2024-01-26',
          premium: 1500,
          currentValue: 1200,
          pnl: -300,
          pnlPercent: -20,
          status: 'OPEN',
          direction: 'LONG',
          openedAt: '2024-01-12T14:30:00Z',
          greeks: { delta: 0.65, gamma: 0.04, theta: -8.3, vega: 12.1 }
        },
        {
          id: '3',
          symbol: 'TSLA',
          type: 'PUT',
          contracts: 3,
          strike: 180,
          expiry: '2024-02-02',
          premium: 900,
          currentValue: 750,
          pnl: 150,
          pnlPercent: 16.7,
          status: 'PENDING',
          direction: 'LONG',
          openedAt: '2024-01-15T09:30:00Z',
          greeks: { delta: -0.45, gamma: 0.03, theta: -5.2, vega: 9.8 }
        }
      ];

      // Save positions to Supabase
      if (user) {
        const { error } = await supabase
          .from('positions')
          .upsert(mockPositions.map(pos => ({
            ...pos,
            user_id: user.id
          })));
        
        if (error) {
          console.error('Error saving positions:', error);
          toast({
            title: "Error",
            description: "Failed to save positions to database",
            variant: "destructive"
          });
        }
      }

      setPositions(mockPositions);
      setOpenPositions(mockPositions.filter(p => p.status === 'OPEN').length);
      setTotalPnL(mockPositions.reduce((sum, pos) => sum + pos.pnl, 0));
      setAccountBalance(50000 + mockPositions.reduce((sum, pos) => sum + pos.pnl, 0));
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [brokerConnected, user, toast]);

  // Load positions from Supabase on mount
  useEffect(() => {
    const loadPositions = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('positions')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error loading positions:', error);
        } else if (data && data.length > 0) {
          setPositions(data);
          setOpenPositions(data.filter(p => p.status === 'OPEN').length);
          setTotalPnL(data.reduce((sum, pos) => sum + pos.pnl, 0));
          setAccountBalance(50000 + data.reduce((sum, pos) => sum + pos.pnl, 0));
        }
      }
    };
    
    loadPositions();
  }, [user]);

  useEffect(() => {
    fetchPositions();
    if (brokerConnected) {
      const interval = setInterval(updatePositionValues, 30000);
      return () => clearInterval(interval);
    }
  }, [brokerConnected, fetchPositions]);

  const updatePositionValues = () => {
    if (!brokerConnected) return;
    
    setPositions(prevPositions => 
      prevPositions.map(pos => {
        const priceChange = (Math.random() - 0.5) * 50;
        const newCurrentValue = Math.max(0, pos.currentValue + priceChange);
        const newPnl = pos.premium - newCurrentValue;
        const newPnlPercent = (newPnl / pos.premium) * 100;
        
        return {
          ...pos,
          currentValue: newCurrentValue,
          pnl: newPnl,
          pnlPercent: newPnlPercent
        };
      })
    );
  };

  const handleConnectBroker = async () => {
    try {
      // Mock broker connection - in real app, this would validate credentials with IG Broker
      if (!brokerSettings.apiKey || !brokerSettings.identifier || !brokerSettings.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Simulate connection delay
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save broker settings to Supabase
      if (user) {
        const { error } = await supabase
          .from('broker_settings')
          .upsert({
            user_id: user.id,
            ...brokerSettings,
            connected: true
          });
        
        if (error) {
          console.error('Error saving broker settings:', error);
        }
      }

      setBrokerSettings(prev => ({ ...prev, connected: true }));
      setBrokerConnected(true);
      setBrokerModalOpen(false);
      setLoading(false);
      
      toast({
        title: "Success",
        description: "Successfully connected to IG Broker",
      });
      
      // Fetch positions after connection
      await fetchPositions();
    } catch (error) {
      console.error('Error connecting to broker:', error);
      toast({
        title: "Error",
        description: "Failed to connect to broker",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleDisconnectBroker = async () => {
    try {
      // Update broker settings in Supabase
      if (user) {
        const { error } = await supabase
          .from('broker_settings')
          .update({ connected: false })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error updating broker settings:', error);
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
        variant: "destructive"
      });
    }
  };

  const handleClosePosition = async (positionId: string) => {
    if (!brokerConnected) return;

    try {
      const updatedPositions = positions.map(pos =>
        pos.id === positionId ? { ...pos, status: 'CLOSED' as const } : pos
      );
      
      setPositions(updatedPositions);
      
      // Update position in Supabase
      if (user) {
        const { error } = await supabase
          .from('positions')
          .update({ status: 'CLOSED' })
          .eq('id', positionId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error updating position:', error);
        }
      }
      
      toast({
        title: "Position Closed",
        description: "Position has been successfully closed",
      });
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Error",
        description: "Failed to close position",
        variant: "destructive"
      });
    }
  };

const toggleAutoTrading = () => {
    if (!brokerConnected) {
      toast({
        title: "Error",
        description: "Please connect to your broker first",
        variant: "destructive"
      });
      return;
    }
    setAutoTrading(!autoTrading);
    
    toast({
      title: autoTrading ? "Auto Trading Stopped" : "Auto Trading Started",
      description: autoTrading ? "Manual trading mode activated" : "Automated trading is now active",
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

        {/* Connection Alert */}
        {!brokerConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to connect to your IG Broker account to view and manage positions.
            </AlertDescription>
          </Alert>
        )}

        {/* Trading Options Selector */}
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

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brokerConnected ? `$${accountBalance.toLocaleString()}` : '$0'}
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {brokerConnected ? '+2.5% this month' : 'Connect to view'}
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
                    <Button className="mt-4" onClick={() => setBrokerModalOpen(true)}>
                      <Link className="h-4 w-4 mr-2" />
                      Connect to Broker
                    </Button>
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
                              <p className="text-gray-600">Premium</p>
                              <p className="font-medium">${position.premium}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Final Value</p>
                              <p className="font-medium">${position.currentValue.toFixed(2)}</p>
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
         <Card>
  <CardContent>
    {dailyPnL && dailyPnL.length > 0 && (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyPnL}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="pnl" 
              stroke="#3B82F6" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </CardContent>
</Card>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Performance Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Trades</span>
          <Badge variant="outline">{analytics.totalTrades}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Win Rate</span>
          <Badge variant={analytics.winRate >= 60 ? "default" : "secondary"}>
            {analytics.winRate}%
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg Win</span>
                        <span className="text-sm font-mono text-green-600">
                          ${analytics.avgWin.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg Loss</span>
                        <span className="text-sm font-mono text-red-600">
                          ${analytics.avgLoss.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Risk/Reward</span>
                        <Badge variant={analytics.riskReward >= 1.5 ? "default" : "destructive"}>
                          {analytics.riskReward.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Max Drawdown</span>
                        <span className="text-sm font-mono text-red-600">
                          {analytics.maxDrawdown.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Risk Per Trade</span>
                        <span className="text-sm font-mono">
                          {analytics.riskPerTrade.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sharpe Ratio</span>
                        <Badge variant={analytics.sharpeRatio >= 1.0 ? "default" : "secondary"}>
                          {analytics.sharpeRatio.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Profit Factor</span>
                        <Badge variant={analytics.profitFactor >= 1.2 ? "default" : "destructive"}>
                          {analytics.profitFactor.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Profit and loss by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#10B981" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="loss" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Activity</CardTitle>
                  <CardDescription>Recent trading activity and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.winningTrades}</div>
                        <div className="text-sm text-gray-500">Winning Trades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{analytics.losingTrades}</div>
                        <div className="text-sm text-gray-500">Losing Trades</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analytics.breakEvenTrades}</div>
                        <div className="text-sm text-gray-500">Break Even</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Best Trading Day</span>
                        <span className="font-mono text-green-600">${analytics.bestDay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Worst Trading Day</span>
                        <span className="font-mono text-red-600">${analytics.worstDay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Daily P&L</span>
                        <span className="font-mono">${analytics.avgDailyPnL.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradingDashboard;
