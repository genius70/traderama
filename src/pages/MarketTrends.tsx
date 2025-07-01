
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent, Clock } from 'lucide-react';
import TradingChart from '@/components/trading/TradingChart';

const MarketTrends = () => {
  const { user, loading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [marketData, setMarketData] = useState([]);

  // Mock market data
  const mockMarketData = [
    { time: '9:30', price: 450.20, volume: 1200000 },
    { time: '10:00', price: 451.50, volume: 980000 },
    { time: '10:30', price: 449.80, volume: 1100000 },
    { time: '11:00', price: 452.30, volume: 890000 },
    { time: '11:30', price: 453.10, volume: 1300000 },
    { time: '12:00', price: 451.90, volume: 750000 },
    { time: '12:30', price: 454.20, volume: 1050000 },
    { time: '13:00', price: 455.60, volume: 1400000 },
    { time: '13:30', price: 454.30, volume: 920000 },
    { time: '14:00', price: 456.10, volume: 1600000 },
    { time: '14:30', price: 457.80, volume: 1250000 },
    { time: '15:00', price: 456.40, volume: 1800000 },
  ];

  const topMovers = [
    { symbol: 'AAPL', price: 185.20, change: +2.45, changePercent: +1.34 },
    { symbol: 'GOOGL', price: 142.80, change: +1.80, changePercent: +1.28 },
    { symbol: 'MSFT', price: 378.50, change: -3.20, changePercent: -0.84 },
    { symbol: 'TSLA', price: 245.60, change: +8.90, changePercent: +3.76 },
    { symbol: 'AMZN', price: 156.30, change: -2.10, changePercent: -1.32 },
    { symbol: 'NVDA', price: 895.40, change: +12.50, changePercent: +1.41 },
  ];

  const marketSummary = {
    spy: { price: 456.40, change: +2.10, changePercent: +0.46 },
    qqq: { price: 386.20, change: -1.50, changePercent: -0.39 },
    iwm: { price: 201.80, change: +0.85, changePercent: +0.42 },
    vix: { price: 18.45, change: -1.25, changePercent: -6.35 },
  };

  useEffect(() => {
    setMarketData(mockMarketData);
  }, [selectedPeriod]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-blue-600" />
            Market Trends
          </h1>
          <p className="text-gray-600">Real-time market data and trending analysis</p>
        </div>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SPY</p>
                  <p className="text-2xl font-bold">${marketSummary.spy.price}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${marketSummary.spy.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.spy.change >= 0 ? '+' : ''}{marketSummary.spy.change}
                  </p>
                  <p className={`text-xs ${marketSummary.spy.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.spy.changePercent >= 0 ? '+' : ''}{marketSummary.spy.changePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">QQQ</p>
                  <p className="text-2xl font-bold">${marketSummary.qqq.price}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${marketSummary.qqq.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.qqq.change >= 0 ? '+' : ''}{marketSummary.qqq.change}
                  </p>
                  <p className={`text-xs ${marketSummary.qqq.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.qqq.changePercent >= 0 ? '+' : ''}{marketSummary.qqq.changePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">IWM</p>
                  <p className="text-2xl font-bold">${marketSummary.iwm.price}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${marketSummary.iwm.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.iwm.change >= 0 ? '+' : ''}{marketSummary.iwm.change}
                  </p>
                  <p className={`text-xs ${marketSummary.iwm.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.iwm.changePercent >= 0 ? '+' : ''}{marketSummary.iwm.changePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">VIX</p>
                  <p className="text-2xl font-bold">{marketSummary.vix.price}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${marketSummary.vix.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.vix.change >= 0 ? '+' : ''}{marketSummary.vix.change}
                  </p>
                  <p className={`text-xs ${marketSummary.vix.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketSummary.vix.changePercent >= 0 ? '+' : ''}{marketSummary.vix.changePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="movers">Top Movers</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>SPY Price Chart</CardTitle>
                    <div className="flex space-x-2">
                      {['1D', '5D', '1M', '3M', '1Y'].map((period) => (
                        <Button
                          key={period}
                          variant={selectedPeriod === period ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPeriod(period)}
                        >
                          {period}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="volume" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <TradingChart symbol="SPY" data={marketData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="movers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topMovers.filter(stock => stock.change > 0).map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-sm text-gray-600">${stock.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600 font-medium">+${stock.change}</p>
                          <p className="text-sm text-green-600">+{stock.changePercent}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topMovers.filter(stock => stock.change < 0).map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-sm text-gray-600">${stock.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-medium">${stock.change}</p>
                          <p className="text-sm text-red-600">{stock.changePercent}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Market Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bull/Bear Ratio</span>
                      <Badge variant="default">65% Bullish</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fear & Greed Index</span>
                      <span className="font-medium">72 (Greed)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Put/Call Ratio</span>
                      <span className="font-medium">0.85</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Percent className="h-5 w-5 mr-2 text-blue-600" />
                    Technical Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">RSI (14)</span>
                      <span className="font-medium">58.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">MACD</span>
                      <Badge variant="outline">Bullish</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Moving Avg (50)</span>
                      <span className="font-medium">$452.10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Market Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">FOMC Meeting</p>
                      <p className="text-xs text-gray-600">Tomorrow, 2:00 PM EST</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Jobs Report</p>
                      <p className="text-xs text-gray-600">Friday, 8:30 AM EST</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Earnings Season</p>
                      <p className="text-xs text-gray-600">Starting next week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MarketTrends;
