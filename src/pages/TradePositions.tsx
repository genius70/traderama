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

      setPositions(mockPositions);
      setOpenPositions(mockPositions.filter(p => p.status === 'OPEN').length);
      setTotalPnL(mockPositions.reduce((sum, pos) => sum + pos.pnl, 0));
      setAccountBalance(50000 + mockPositions.reduce((sum, pos) => sum + pos.pnl, 0));
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  }, [brokerConnected]);

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
        alert('Please fill in all required fields');
        return;
      }

      // Simulate connection delay
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setBrokerSettings(prev => ({ ...prev, connected: true }));
      setBrokerConnected(true);
      setBrokerModalOpen(false);
      setLoading(false);
      
      // Fetch positions after connection
      await fetchPositions();
    } catch (error) {
      console.error('Error connecting to broker:', error);
      setLoading(false);
    }
  };

  const handleDisconnectBroker = () => {
    setBrokerSettings(prev => ({ ...prev, connected: false }));
    setBrokerConnected(false);
    setPositions([]);
    setOpenPositions(0);
    setTotalPnL(0);
    setAccountBalance(0);
    setAutoTrading(false);
  };

  const handleClosePosition = async (positionId: string) => {
    if (!brokerConnected) return;

    try {
      setPositions(prevPositions =>
        prevPositions.map(pos =>
          pos.id === positionId ? { ...pos, status: 'CLOSED' as const } : pos
        )
      );
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const toggleAutoTrading = () => {
    if (!brokerConnected) {
      alert('Please connect to your broker first');
      return;
    }
    setAutoTrading(!autoTrading);
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
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
                <div className="text-center py-8 text-gray-500">
                  <p>No closed positions to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>P&L Chart</CardTitle>
                <CardDescription>Daily profit and loss over the last week</CardDescription>
              </CardHeader>
              <CardContent>
                {!brokerConnected ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Connect to your broker to view analytics</p>
                  </div>
                ) : (
                  <div className="h-64">
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

            {brokerConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span className="font-medium">68.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Trade</span>
                      <span className="font-medium">$245.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest Win</span>
                      <span className="font-medium text-green-600">$1,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest Loss</span>
                      <span className="font-medium text-red-600">-$680</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Portfolio Utilization</span>
                        <span className="font-medium">34%</span>
                      </div>
                      <Progress value={34} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Max Drawdown</span>
                        <span className="font-medium">8.2%</span>
                      </div>
                      <Progress value={8.2} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio</span>
                      <span className="font-medium">1.85</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="broker">
          <Card>
            <CardHeader>
              <CardTitle>Broker Connection</CardTitle>
              <CardDescription>
                Connect your IG Broker account to manage positions and execute trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Link className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">IG Broker</h3>
                      <p className="text-sm text-gray-600">
                        {brokerConnected ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {brokerConnected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    {brokerConnected ? (
                      <Button variant="outline" onClick={handleDisconnectBroker}>
                        Disconnect
                      </Button>
                    ) : (
                      <Dialog open={brokerModalOpen} onOpenChange={setBrokerModalOpen}>
                        <DialogTrigger asChild>
                          <Button>Connect</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Connect to IG Broker</DialogTitle>
                            <DialogDescription>
                              Enter your IG Broker credentials to connect your account
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="identifier">Username/Identifier</Label>
                              <Input
                                id="identifier"
                                placeholder="Enter your IG username"
                                value={brokerSettings.identifier}
                                onChange={(e) => setBrokerSettings(prev => ({ ...prev, identifier: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  value={brokerSettings.password}
                                  onChange={(e) => setBrokerSettings(prev => ({ ...prev, password: e.target.value }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="apiKey">API Key</Label>
                              <div className="relative">
                                <Input
                                  id="apiKey"
                                  type={showApiKey ? "text" : "password"}
                                  placeholder="Enter your API key"
                                  value={brokerSettings.apiKey}
                                  onChange={(e) => setBrokerSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowApiKey(!showApiKey)}
                                >
                                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="demo-mode"
                                checked={brokerSettings.isDemo}
                                onCheckedChange={(checked) => setBrokerSettings(prev => ({ ...prev, isDemo: checked }))}
                              />
                              <Label htmlFor="demo-mode">Demo Account</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="auto-sync"
                                checked={brokerSettings.autoSync}
                                onCheckedChange={(checked) => setBrokerSettings(prev => ({ ...prev, autoSync: checked }))}
                              />
                              <Label htmlFor="auto-sync">Auto-sync positions</Label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setBrokerModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleConnectBroker} disabled={loading}>
                                {loading ? (
                                  <>
                                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <Link className="h-4 w-4 mr-2" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
               {brokerConnected && (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully connected to IG Broker. Auto-sync is {brokerSettings.autoSync ? 'enabled' : 'disabled'}.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Account Type</span>
                            <Badge variant={brokerSettings.isDemo ? "secondary" : "default"}>
                              {brokerSettings.isDemo ? "Demo" : "Live"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Auto-sync</span>
                            <Badge variant={brokerSettings.autoSync ? "default" : "secondary"}>
                              {brokerSettings.autoSync ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Connection Status</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Connected
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Username</span>
                            <span className="text-sm font-medium">{brokerSettings.identifier}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">API Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">API Key</span>
                            <span className="text-sm font-mono">
                              {brokerSettings.apiKey ? '****' + brokerSettings.apiKey.slice(-4) : 'Not set'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rate Limit</span>
                            <span className="text-sm text-green-600">Normal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Sync</span>
                            <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Market Hours</span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Open
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Trading Permissions</CardTitle>
                        <CardDescription>
                          Your account has access to the following trading capabilities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Options Trading</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Spreads</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Iron Condors</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Auto Trading</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {!brokerConnected && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Link className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Connect Your Broker</h3>
                    <p className="text-gray-600 mb-4">
                      Connect your IG Broker account to start managing your positions and executing trades automatically.
                    </p>
                    <Button onClick={() => setBrokerModalOpen(true)}>
                      <Link className="h-4 w-4 mr-2" />
                      Connect to IG Broker
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradePositions;
