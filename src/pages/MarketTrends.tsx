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

const ALPHA_VANTAGE_API_KEY = '8AQPB7J6D8TUCDJA';
const TIMEFRAMES = {
  hourly: 'TIME_SERIES_INTRADAY&interval=60min',
  daily: 'TIME_SERIES_DAILY',
  weekly: 'TIME_SERIES_WEEKLY',
  monthly: 'TIME_SERIES_MONTHLY',
  yearly: 'TIME_SERIES_MONTHLY' // Processed to show yearly trends
};

const MarketTrends = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof TIMEFRAMES>('daily');
  const { toast } = useToast();

  // Calculate technical indicators
  const calculateIndicators = (prices: number[]): { sma20: number[], rsi: number[], macd: number[], signal: number[], upperBB: number[], lowerBB: number[] } => {
    const sma20: number[] = [];
    const rsi: number[] = [];
    const macd: number[] = [];
    const signal: number[] = [];
    const upperBB: number[] = [];
    const lowerBB: number[] = [];

    // SMA20
    for (let i = 0; i < prices.length; i++) {
      if (i < 20) {
        sma20.push(0);
      } else {
        const sum = prices.slice(i - 20, i).reduce((a, b) => a + b, 0);
        sma20.push(sum / 20);
      }
    }

    // RSI
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

    // MACD
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    for (let i = 0; i < prices.length; i++) {
      macd.push(ema12[i] - ema26[i]);
    }
    const signalLine = calculateEMA(macd, 9);
    signal.push(...signalLine);

    // Bollinger Bands
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

  // Helper function for EMA calculation
  const calculateEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  // Fetch live market data from Alpha Vantage
  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const symbols = ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD'];
      const marketDataPromises = symbols.map(async (symbol) => {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        const quote = data['Global Quote'];
        
        if (!quote) {
          throw new Error(`No data for ${symbol}`);
        }

        return {
          symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
        };
      });

      const liveData = await Promise.all(marketDataPromises);
      setMarketData(liveData);

      // Save to Supabase
      await supabase.from('market_data')
        .upsert(liveData.map(item => ({
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          change_percent: item.changePercent,
          volume: item.volume,
          updated_at: new Date().toISOString()
        })));
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data from Alpha Vantage');
      toast({
        title: "Data Error",
        description: "Unable to fetch live market data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch historical chart data
  const fetchChartData = useCallback(async (symbol: string, timeframe: keyof typeof TIMEFRAMES) => {
    try {
      const endpoint = TIMEFRAMES[timeframe];
      const response = await fetch(
        `https://www.alphavantage.co/query?function=${endpoint}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const data = await response.json();
      
      let timeSeriesKey: string;
      switch (timeframe) {
        case 'hourly':
          timeSeriesKey = 'Time Series (60min)';
          break;
        case 'daily':
          timeSeriesKey = 'Time Series (Daily)';
          break;
        case 'weekly':
          timeSeriesKey = 'Weekly Time Series';
          break;
        default:
          timeSeriesKey = 'Monthly Time Series';
      }

      const timeSeries = data[timeSeriesKey];
      if (!timeSeries) {
        throw new Error('No time series data available');
      }

      const prices = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'] || '0')
      }));

      // Calculate indicators
      const priceValues = prices.map(p => p.price);
      const { sma20, rsi, macd, signal, upperBB, lowerBB } = calculateIndicators(priceValues);

      const transformedChartData: ChartData[] = prices.map((item, index) => ({
        date: item.date,
        price: item.price,
        volume: item.volume,
        sma20: sma20[index],
        rsi: rsi[index],
        macd: macd[index],
        signal: signal[index],
        upperBB: upperBB[index],
        lowerBB: lowerBB[index]
      }));

      // For yearly view, aggregate monthly data
      if (timeframe === 'yearly') {
        const yearlyData: ChartData[] = [];
        const years = new Set(transformedChartData.map(d => new Date(d.date).getFullYear()));
        
        years.forEach(year => {
          const yearData = transformedChartData.filter(d => new Date(d.date).getFullYear() === year);
          if (yearData.length > 0) {
            const avgPrice = yearData.reduce((sum, d) => sum + d.price, 0) / yearData.length;
            const avgVolume = yearData.reduce((sum, d) => sum + d.volume, 0) / yearData.length;
            yearlyData.push({
              date: year.toString(),
              price: avgPrice,
              volume: avgVolume,
              sma20: yearData[yearData.length - 1].sma20,
              rsi: yearData[yearData.length - 1].rsi,
              macd: yearData[yearData.length - 1].macd,
              signal: yearData[yearData.length - 1].signal,
              upperBB: yearData[yearData.length - 1].upperBB,
              lowerBB: yearData[yearData.length - 1].lowerBB
            });
          }
        });
        setChartData(yearlyData);
      } else {
        setChartData(transformedChartData.slice(0, 30)); // Limit to recent 30 data points
      }

      // Save to Supabase
      await supabase.from('price_history').upsert(
        transformedChartData.map(item => ({
          symbol,
          date: item.date,
          price: item.price,
          volume: item.volume,
          sma20: item.sma20,
          rsi: item.rsi,
          macd: item.macd,
          signal: item.signal,
          upperBB: item.upperBB,
          lowerBB: item.lowerBB
        }))
      );
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data');
      toast({
        title: "Data Error",
        description: "Unable to fetch historical chart data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  // Fetch chart data when symbol or timeframe changes
  useEffect(() => {
    fetchChartData(selectedSymbol, selectedTimeframe);
  }, [selectedSymbol, selectedTimeframe, fetchChartData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
      fetchChartData(selectedSymbol, selectedTimeframe);
    }, 5 * 60 * 1000); // 5 minutes

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
              ⚠️ Live data connection issue
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
