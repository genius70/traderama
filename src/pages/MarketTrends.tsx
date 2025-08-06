import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle } from 'lucide-react';
import MarketChart from '@/components/market/MarketChart';
import SpyReturnsDistribution from '@/components/strategies/SpyReturnsDistribution';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

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
  macd: number;
  signal: number;
  upperBB: number;
  lowerBB: number;
}

const TIMEFRAMES = {
  hourly: 'TIME_SERIES_INTRADAY&interval=60min',
  daily: 'TIME_SERIES_DAILY',
  weekly: 'TIME_SERIES_WEEKLY',
  monthly: 'TIME_SERIES_MONTHLY',
  yearly: 'TIME_SERIES_MONTHLY'
};

const MarketTrends = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof TIMEFRAMES>('daily');
  const { toast } = useToast();

  const calculateIndicators = (prices: number[]): { sma20: number[], rsi: number[], macd: number[], signal: number[], upperBB: number[], lowerBB: number[] } => {
    const sma20: number[] = [];
    const rsi: number[] = [];
    const macd: number[] = [];
    const signal: number[] = [];
    const upperBB: number[] = [];
    const lowerBB: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (i < 20) {
        sma20.push(0);
      } else {
        const sum = prices.slice(i - 20, i).reduce((a, b) => a + b, 0);
        sma20.push(sum / 20);
      }
    }

    let gains = 0;
    let losses = 0;
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
      
      if (i >= 14) {
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgGain / (avgLoss || 1);
        rsi.push(100 - (100 / (1 + rs)));
      } else {
        rsi.push(50);
      }
    }

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    for (let i = 0; i < prices.length; i++) {
      macd.push(ema12[i] - ema26[i]);
    }
    const signalLine = calculateEMA(macd, 9);
    signal.push(...signalLine);

    for (let i = 0; i < prices.length; i++) {
      if (i < 20) {
        upperBB.push(0);
        lowerBB.push(0);
      } else {
        const slice = prices.slice(i - 20, i);
        const mean = slice.reduce((a, b) => a + b) / 20;
        const stdDev = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20);
        upperBB.push(mean + 2 * stdDev);
        lowerBB.push(mean - 2 * stdDev);
      }
    }

    return { sma20, rsi, macd, signal, upperBB, lowerBB };
  };

  const calculateEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to get cached data from Supabase
      const { data: cachedData, error: cacheError } = await supabase
        .from('live_market_data')
        .select('*')
        .in('symbol', ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD'])
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutes ago

      if (!cacheError && cachedData && cachedData.length > 0) {
        const formattedData = cachedData.map(item => ({
          symbol: item.symbol,
          price: item.price,
          change: 0, // Will be calculated if needed
          changePercent: item.change_percent || 0,
          volume: item.volume || 0,
        }));
        setMarketData(formattedData);
        setLoading(false);
        return;
      }

      // If no cached data, call the edge function to fetch fresh data
      const { data: freshData, error: fetchError } = await supabase.functions.invoke('alpha-vantage-market-data', {
        body: { symbols: ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD'] }
      });

      if (fetchError) {
        throw new Error(`Edge function error: ${fetchError.message}`);
      }

      if (freshData && freshData.success && freshData.data) {
        const formattedData = freshData.data.map((item: any) => ({
          symbol: item.symbol,
          price: item.price,
          change: 0,
          changePercent: item.change_percent || 0,
          volume: item.volume || 0,
        }));
        setMarketData(formattedData);
      } else {
        throw new Error('No data returned from market data service');
      }

    } catch (err) {
      console.error('Error fetching market data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      
      // Try to load any available cached data as fallback
      const { data: fallbackData } = await supabase
        .from('live_market_data')
        .select('*')
        .in('symbol', ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD'])
        .order('timestamp', { ascending: false })
        .limit(5);

      if (fallbackData && fallbackData.length > 0) {
        const formattedData = fallbackData.map(item => ({
          symbol: item.symbol,
          price: item.price,
          change: 0,
          changePercent: item.change_percent || 0,
          volume: item.volume || 0,
        }));
        setMarketData(formattedData);
        setError(`${errorMessage} (showing cached data)`);
      }
      
      toast({
        title: "Data Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchChartData = useCallback(async (symbol: string, timeframe: keyof typeof TIMEFRAMES) => {
    try {
      // First try to get cached price history data
      const { data: cachedPriceData, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!priceError && cachedPriceData && cachedPriceData.length > 0) {
        const transformedData: ChartData[] = cachedPriceData.map(item => ({
          date: item.date,
          price: item.price,
          volume: item.volume || 0,
          sma20: item.sma20 || 0,
          rsi: item.rsi || 50,
          macd: item.macd || 0,
          signal: item.signal || 0,
          upperBB: item.upperbb || 0,
          lowerBB: item.lowerbb || 0
        }));
        
        setChartData(transformedData.slice(0, 30));
        return;
      }

      // Fallback to Alpha Vantage API with edge function
      const { data: chartResponse, error: chartError } = await supabase.functions.invoke('fetch-polygon-data', {
        body: {
          symbol,
          timeframe: timeframe === 'daily' ? 'day' : timeframe,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      });

      if (chartError) {
        throw new Error(`Chart data error: ${chartError.message}`);
      }

      if (chartResponse && chartResponse.results) {
        const prices = chartResponse.results.map((item: any) => item.c || 0);
        const { sma20, rsi, macd, signal, upperBB, lowerBB } = calculateIndicators(prices);

        const transformedData: ChartData[] = chartResponse.results.map((item: any, index: number) => ({
          date: new Date(item.t).toISOString().split('T')[0],
          price: item.c || 0,
          volume: item.v || 0,
          sma20: sma20[index] || 0,
          rsi: rsi[index] || 50,
          macd: macd[index] || 0,
          signal: signal[index] || 0,
          upperBB: upperBB[index] || 0,
          lowerBB: lowerBB[index] || 0
        }));

        setChartData(transformedData.slice(0, 30));
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data';
      setError(errorMessage);
      toast({
        title: "Data Error",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    fetchChartData(selectedSymbol, selectedTimeframe);
  }, [selectedSymbol, selectedTimeframe, fetchChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
      fetchChartData(selectedSymbol, selectedTimeframe);
    }, 2 * 60 * 1000); // Update every 2 minutes for more frequent live data

    return () => clearInterval(interval);
  }, [fetchMarketData, fetchChartData, selectedSymbol, selectedTimeframe]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Trends</h1>
          <p className="text-gray-600">Real-time market analysis and trading opportunities</p>
          {error && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={sentiment === 'bullish' ? 'default' : sentiment === 'bearish' ? 'destructive' : 'secondary'}>
            Market Sentiment: {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMarketData();
              fetchChartData(selectedSymbol, selectedTimeframe);
            }}
          >
            Refresh
          </Button>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Chart - {selectedSymbol}</CardTitle>
                  <CardDescription>{selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} price movement</CardDescription>
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
                  {['hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
                    <Button
                      key={tf}
                      variant={selectedTimeframe === tf ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeframe(tf as keyof typeof TIMEFRAMES)}
                    >
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
                    <Line yAxisId="left" type="monotone" dataKey="sma20" stroke="#82ca9d" name="SMA20" />
                    <Line yAxisId="left" type="monotone" dataKey="upperBB" stroke="#ff7300" name="Upper BB" strokeDasharray="3 3" />
                    <Line yAxisId="left" type="monotone" dataKey="lowerBB" stroke="#ff7300" name="Lower BB" strokeDasharray="3 3" />
                    <Line yAxisId="right" type="monotone" dataKey="rsi" stroke="#ff0000" name="RSI" />
                    <Line yAxisId="left" type="monotone" dataKey="macd" stroke="#00ff00" name="MACD" />
                    <Line yAxisId="left" type="monotone" dataKey="signal" stroke="#0000ff" name="Signal" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                    <Badge variant="secondary">
                      {chartData.length > 0 ? chartData[chartData.length - 1].rsi.toFixed(1) : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>MACD</span>
                    <Badge variant={chartData.length > 0 && chartData[chartData.length - 1].macd > chartData[chartData.length - 1].signal ? 'default' : 'destructive'}>
                      {chartData.length > 0 ? (chartData[chartData.length - 1].macd > chartData[chartData.length - 1].signal ? 'Bullish' : 'Bearish') : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Moving Average (20)</span>
                    <Badge variant="secondary">
                      ${chartData.length > 0 ? chartData[chartData.length - 1].sma20.toFixed(2) : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Upper Bollinger Band</span>
                    <Badge variant="outline">
                      ${chartData.length > 0 ? chartData[chartData.length - 1].upperBB.toFixed(2) : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lower Bollinger Band</span>
                    <Badge variant="outline">
                      ${chartData.length > 0 ? chartData[chartData.length - 1].lowerBB.toFixed(2) : 'N/A'}
                    </Badge>
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
                  {chartData.length > 0 && (
                    <>
                      {chartData[chartData.length - 1].volume > chartData.slice(-10, -1).reduce((a, b) => a + b.volume, 0) / 9 * 1.5 && (
                        <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                          <p className="font-medium">Volume Spike</p>
                          <p className="text-sm text-gray-600">{selectedSymbol} volume significantly above average</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].price > chartData[chartData.length - 1].upperBB && (
                        <div className="p-3 border-l-4 border-green-500 bg-green-50">
                          <p className="font-medium">Breakout Alert</p>
                          <p className="text-sm text-gray-600">{selectedSymbol} broke above upper Bollinger Band</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].price < chartData[chartData.length - 1].lowerBB && (
                        <div className="p-3 border-l-4 border-red-500 bg-red-50">
                          <p className="font-medium">Support Test</p>
                          <p className="text-sm text-gray-600">{selectedSymbol} testing lower Bollinger Band</p>
                        </div>
                      )}
                    </>
                  )}
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
                    { sector: 'Technology', performance: marketData.find(d => d.symbol === 'QQQ')?.changePercent || 0 },
                    { sector: 'Broad Market', performance: marketData.find(d => d.symbol === 'SPY')?.changePercent || 0 },
                    { sector: 'Small Caps', performance: marketData.find(d => d.symbol === 'IWM')?.changePercent || 0 },
                    { sector: 'Commodities', performance: marketData.find(d => d.symbol === 'GLD')?.changePercent || 0 },
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
