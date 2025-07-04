
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle } from 'lucide-react';
import MarketChart from '@/components/market/MarketChart';
import SpyReturnsDistribution from '@/components/strategies/SpyReturnsDistribution';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface ChartData {
  date: string;
  price: number;
  volume: number;
  sma20: number;
  rsi: number;
}

const MarketTrends = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Mock data - in real app this would come from a market data API
  const mockMarketData: MarketData[] = [
    { symbol: 'SPY', price: 423.45, change: 2.34, changePercent: 0.56, volume: 45234567 },
    { symbol: 'QQQ', price: 367.23, change: -1.45, changePercent: -0.39, volume: 32456789 },
    { symbol: 'IWM', price: 198.76, change: 0.89, changePercent: 0.45, volume: 23456789 },
    { symbol: 'VIX', price: 18.43, change: -2.34, changePercent: -11.25, volume: 0 },
    { symbol: 'GLD', price: 189.45, change: 1.23, changePercent: 0.65, volume: 12345678 }
  ];

  const mockChartData: ChartData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 420 + Math.random() * 20 - 10,
    volume: 40000000 + Math.random() * 20000000,
    sma20: 422 + Math.random() * 6 - 3,
    rsi: 30 + Math.random() * 40
  }));

  useEffect(() => {
    setMarketData(mockMarketData);
    setChartData(mockChartData);
  }, []);

  const topMovers = marketData
    .filter(item => item.symbol !== 'VIX')
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

  const marketSentiment = () => {
    const vixData = marketData.find(item => item.symbol === 'VIX');
    if (!vixData) return 'neutral';
    
    if (vixData.price < 20) return 'bullish';
    if (vixData.price > 30) return 'bearish';
    return 'neutral';
  };

  const sentiment = marketSentiment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Trends</h1>
          <p className="text-gray-600">Real-time market analysis and trading opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={sentiment === 'bullish' ? 'default' : sentiment === 'bearish' ? 'destructive' : 'secondary'}>
            Market Sentiment: {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Returns Distribution</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.slice(0, 4).map((item) => (
              <Card key={item.symbol} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.symbol}</CardTitle>
                    {item.changePercent > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
                    <p className={`text-sm ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change > 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </p>
                    {item.volume > 0 && (
                      <p className="text-xs text-gray-500">
                        Vol: {(item.volume / 1000000).toFixed(1)}M
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Top Movers
              </CardTitle>
              <CardDescription>Stocks with the highest volatility today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMovers.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.changePercent > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-medium ${item.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Chart - {selectedSymbol}</CardTitle>
                  <CardDescription>30-day price movement</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {['SPY', 'QQQ', 'IWM'].map((symbol) => (
                    <Button
                      key={symbol}
                      variant={selectedSymbol === symbol ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSymbol(symbol)}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MarketChart data={chartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>RSI (14)</span>
                    <Badge variant="secondary">45.2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>MACD</span>
                    <Badge variant="default">Bullish</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Moving Average (20)</span>
                    <Badge variant="secondary">$422.15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Support Level</span>
                    <Badge variant="outline">$415.00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resistance Level</span>
                    <Badge variant="outline">$430.00</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Market Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <p className="font-medium">Volume Spike</p>
                    <p className="text-sm text-gray-600">SPY volume 50% above average</p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <p className="font-medium">Breakout Alert</p>
                    <p className="text-sm text-gray-600">QQQ broke above resistance at $365</p>
                  </div>
                  <div className="p-3 border-l-4 border-red-500 bg-red-50">
                    <p className="font-medium">Support Test</p>
                    <p className="text-sm text-gray-600">IWM testing key support at $195</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <SpyReturnsDistribution />
        </TabsContent>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>Today's sector rotation and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { sector: 'Technology', performance: 1.2 },
                    { sector: 'Healthcare', performance: 0.8 },
                    { sector: 'Finance', performance: -0.3 },
                    { sector: 'Energy', performance: 2.1 },
                    { sector: 'Consumer', performance: 0.5 },
                    { sector: 'Industrial', performance: -0.1 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="performance" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketTrends;
