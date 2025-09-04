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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/layout/Header';
import { IGBrokerConnect } from '@/components/brokers';
import { useIGBroker } from '@/hooks/useIGBroker';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  RefreshCcw, 
  Settings, 
  Wifi, 
  WifiOff, 
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

interface Instrument {
  symbol: string;
  market: 'AMERICAN' | 'EUROPEAN';
  name: string;
}

const TradePositions = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [openPositions, setOpenPositions] = useState(0);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [openPositionModal, setOpenPositionModal] = useState(false);
  const [dailyPnL, setDailyPnL] = useState<{ date: string; pnl: number }[]>([]);
  const [brokerSettings, setBrokerSettings] = useState<BrokerSettings>({
    apiKey: '',
    identifier: '',
    password: '',
    isDemo: false, // Set to live trading by default
    connected: false,
    autoSync: true
  });
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    type: '' as 'CALL' | 'PUT' | 'IRON_CONDOR' | 'BULL_SPREAD' | 'BEAR_SPREAD',
    contracts: 1,
    strike: 0,
    expiry: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    market: 'AMERICAN' as 'AMERICAN' | 'EUROPEAN'
  });
  const [availableInstruments, setAvailableInstruments] = useState<Instrument[]>([]);

  const {
    connectToBroker,
    disconnectBroker,
    getPositions,
    getAccountBalance,
    getTradeHistory,
    getAvailableInstruments,
    openPosition
  } = useIGBroker();

  const fetchData = useCallback(async () => {
    if (!brokerConnected) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [positionsData, balance, history, instruments] = await Promise.all([
        getPositions(),
        getAccountBalance(),
        getTradeHistory(),
        getAvailableInstruments()
      ]);

      setPositions(positionsData);
      setAccountBalance(balance);
      setOpenPositions(positionsData.filter((p: Position) => p.status === 'OPEN').length);
      setTotalPnL(positionsData.reduce((sum: number, pos: Position) => sum + pos.pnl, 0));
      setDailyPnL(history.dailyPnL || []);
      setAvailableInstruments(instruments.filter((i: any) => ['AMERICAN', 'EUROPEAN'].includes(i.market)));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data from broker');
    } finally {
      setLoading(false);
    }
  }, [brokerConnected, getPositions, getAccountBalance, getTradeHistory, getAvailableInstruments]);

  useEffect(() => {
    fetchData();
    if (brokerConnected && brokerSettings.autoSync) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [brokerConnected, brokerSettings.autoSync, fetchData]);

  const handleConnectBroker = async (credentials: {
    apiKey: string;
    identifier: string;
    password: string;
    isDemo: boolean;
  }) => {
    try {
      setLoading(true);
      const result = await connectToBroker({
        username: credentials.identifier,
        password: credentials.password,
        apiKey: credentials.apiKey,
        accountId: 'demo-account'
      });
      if (result.success) {
        setBrokerSettings(prev => ({ ...prev, ...credentials, connected: true }));
        setBrokerConnected(true);
        setBrokerModalOpen(false);
        await fetchData();
      } else {
        throw new Error('Broker connection failed');
      }
    } catch (error) {
      console.error('Error connecting to broker:', error);
      alert('Failed to connect to broker. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectBroker = async () => {
    try {
      await disconnectBroker();
      setBrokerSettings(prev => ({ ...prev, connected: false }));
      setBrokerConnected(false);
      setPositions([]);
      setOpenPositions(0);
      setTotalPnL(0);
      setAccountBalance(0);
      setAvailableInstruments([]);
    } catch (error) {
      console.error('Error disconnecting broker:', error);
      alert('Failed to disconnect broker');
    }
  };

  const handleOpenPosition = async () => {
    if (!brokerConnected) {
      alert('Please connect to your broker first');
      return;
    }
    if (!newPosition.symbol || !newPosition.type || !newPosition.expiry || !newPosition.strike) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const position = await openPosition({
        symbol: newPosition.symbol,
        type: newPosition.type,
        contracts: newPosition.contracts,
        strike: newPosition.strike,
        expiry: newPosition.expiry,
        direction: newPosition.direction
      });
      setPositions(prev => [...prev, position]);
      setOpenPositions(prev => prev + 1);
      setTotalPnL(prev => prev + position.pnl);
      setOpenPositionModal(false);
      setNewPosition({
        symbol: '',
        type: '' as 'CALL' | 'PUT' | 'IRON_CONDOR' | 'BULL_SPREAD' | 'BEAR_SPREAD',
        contracts: 1,
        strike: 0,
        expiry: '',
        direction: 'LONG',
        market: 'AMERICAN'
      });
    } catch (error) {
      console.error('Error opening position:', error);
      alert('Failed to open position');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    if (!brokerConnected) return;

    try {
      setLoading(true);
      // Mock close position functionality
      console.log('Closing position:', positionId);
      setPositions(prev =>
        prev.map(pos =>
          pos.id === positionId ? { ...pos, status: 'CLOSED' } : pos
        )
      );
      setOpenPositions(prev => prev - 1);
    } catch (error) {
      console.error('Error closing position:', error);
      alert('Failed to close position');
    } finally {
      setLoading(false);
    }
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
      <Header />
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
          <Button variant="outline" onClick={fetchData} disabled={!brokerConnected}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {brokerConnected && (
            <Dialog open={openPositionModal} onOpenChange={setOpenPositionModal}>
              <DialogTrigger asChild>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Open Position
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Open New Position</DialogTitle>
                  <DialogDescription>Select and configure your stock option position</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Market</Label>
                    <Select
                      value={newPosition.market}
                      onValueChange={(value) => setNewPosition(prev => ({ ...prev, market: value as 'AMERICAN' | 'EUROPEAN', symbol: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AMERICAN">American</SelectItem>
                        <SelectItem value="EUROPEAN">European</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Select
                      value={newPosition.symbol}
                      onValueChange={(value) => setNewPosition(prev => ({ ...prev, symbol: value }))}
                      disabled={!newPosition.market}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInstruments
                          .filter((inst: Instrument) => inst.market === newPosition.market)
                          .map((inst: Instrument) => (
                            <SelectItem key={inst.symbol} value={inst.symbol}>
                              {inst.name} ({inst.symbol})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Option Type</Label>
                    <Select
                      value={newPosition.type}
                      onValueChange={(value) => setNewPosition(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CALL">Call</SelectItem>
                        <SelectItem value="PUT">Put</SelectItem>
                        <SelectItem value="IRON_CONDOR">Iron Condor</SelectItem>
                        <SelectItem value="BULL_SPREAD">Bull Spread</SelectItem>
                        <SelectItem value="BEAR_SPREAD">Bear Spread</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select
                      value={newPosition.direction}
                      onValueChange={(value) => setNewPosition(prev => ({ ...prev, direction: value as 'LONG' | 'SHORT' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LONG">Long</SelectItem>
                        <SelectItem value="SHORT">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contracts</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newPosition.contracts}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, contracts: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strike Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newPosition.strike}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, strike: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={newPosition.expiry}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setOpenPositionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleOpenPosition} disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Open Position
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

      {!brokerConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to connect to your IG Broker account to view and manage positions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {brokerConnected ? `$${accountBalance.toLocaleString()}` : '$0'}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-3 w-3 mr-1" />
              Available Balance
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
              <CardDescription>Currently open and pending trading positions</CardDescription>
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
              ) : positions.filter(pos => pos.status === 'CLOSED').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No closed positions to display</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.filter(pos => pos.status === 'CLOSED').map((position) => (
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
                    </div>
                  ))}
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
                ) : dailyPnL.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No P&L data available</p>
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
                      <span className="font-medium">{/* Fetch from broker API */}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Trade</span>
                      <span className="font-medium">$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest Win</span>
                      <span className="font-medium text-green-600">$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest Loss</span>
                      <span className="font-medium text-red-600">$</span>
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
                        <span className="font-medium">{/* Fetch from broker API */}%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Max Drawdown</span>
                        <span className="font-medium">{/* Fetch from broker API */}%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio</span>
                      <span className="font-medium">{/* Fetch from broker API */}</span>
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
                <IGBrokerConnect 
                  onConnect={() => handleConnectBroker({
                    apiKey: 'demo-key',
                    identifier: 'demo-user',
                    password: 'demo-pass',
                    isDemo: true
                  })} 
                  onClose={() => {}}
                />
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
                            <span className="text-sm">Manual Trading</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
