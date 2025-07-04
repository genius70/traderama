
import React, { useState, useEffect } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, RefreshCcw, Settings, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';

// Mock interfaces for demonstration
interface Position {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT' | 'IRON_CONDOR';
  contracts: number;
  strike: number;
  expiry: string;
  premium: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
}

const TradePositions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [autoTrading, setAutoTrading] = useState(false);
  const [accountBalance, setAccountBalance] = useState(50000);
  const [totalPnL, setTotalPnL] = useState(0);
  const [openPositions, setOpenPositions] = useState(0);
  const [dailyPnL] = useState([
    { date: '2024-01-01', pnl: 450 },
    { date: '2024-01-02', pnl: -200 },
    { date: '2024-01-03', pnl: 800 },
    { date: '2024-01-04', pnl: 320 },
    { date: '2024-01-05', pnl: -150 },
    { date: '2024-01-06', pnl: 600 },
    { date: '2024-01-07', pnl: 920 }
  ]);

  useEffect(() => {
    if (user) {
      fetchPositions();
      // Set up real-time updates
      const interval = setInterval(updatePositionValues, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPositions = async () => {
    try {
      // Mock positions data - in real app, this would come from your broker API
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
          openedAt: '2024-01-10T10:00:00Z'
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
          openedAt: '2024-01-12T14:30:00Z'
        }
      ];

      setPositions(mockPositions);
      setOpenPositions(mockPositions.filter(p => p.status === 'OPEN').length);
      setTotalPnL(mockPositions.reduce((sum, pos) => sum + pos.pnl, 0));
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: "Error loading positions",
        description: "Failed to load trading positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePositionValues = () => {
    // Mock real-time price updates
    setPositions(prevPositions => 
      prevPositions.map(pos => ({
        ...pos,
        currentValue: pos.currentValue + (Math.random() - 0.5) * 100,
        pnl: pos.premium - (pos.currentValue + (Math.random() - 0.5) * 100)
      }))
    );
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      // Mock closing position - in real app, this would call broker API
      setPositions(prevPositions =>
        prevPositions.map(pos =>
          pos.id === positionId ? { ...pos, status: 'CLOSED' as const } : pos
        )
      );
      
      toast({
        title: "Position closed",
        description: "Position has been successfully closed",
      });
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Error closing position",
        description: "Failed to close position",
        variant: "destructive",
      });
    }
  };

  const toggleAutoTrading = () => {
    setAutoTrading(!autoTrading);
    toast({
      title: autoTrading ? "Auto-trading disabled" : "Auto-trading enabled",
      description: autoTrading ? "Manual trading mode activated" : "Automated trading mode activated",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading positions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trade Positions</h1>
          <p className="text-gray-600">Monitor and manage your active trading positions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchPositions}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountBalance.toLocaleString()}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.5% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
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
          <TabsTrigger value="options">Options Trading</TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>
                Currently open trading positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.filter(pos => pos.status === 'OPEN').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active positions</p>
                  <p className="text-sm">Your open trades will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.filter(pos => pos.status === 'OPEN').map((position) => (
                    <div key={position.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{position.symbol}</h3>
                          <Badge variant="outline">{position.type}</Badge>
                          <Badge variant={position.pnl >= 0 ? 'default' : 'destructive'}>
                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleClosePosition(position.id)}
                        >
                          Close Position
                        </Button>
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
                          <p className="text-gray-600">Premium Paid</p>
                          <p className="font-medium">${position.premium}</p>
                        </div>
                      </div>

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
              <div className="text-center py-8 text-gray-500">
                <p>No closed positions to display</p>
              </div>
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
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>

        <TabsContent value="options">
          <TradingOptionsSelector />
        </TabsContent>
      </Tabs>

      {/* Risk Alert */}
      {totalPnL < -1000 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your current unrealized loss is significant. Consider reviewing your positions and risk management strategy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TradePositions;
