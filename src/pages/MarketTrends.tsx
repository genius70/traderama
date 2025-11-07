import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Config {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

// Define market symbols as a constant
const MARKET_SYMBOLS = ['SPY', 'QQQ', 'IWM', 'VIX', 'GLD', 'DIA', 'EEM', 'TLT', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 'XLB', 'XLRE', 'XLC', 'SMH'];

const TIMEFRAMES = {
  hourly: { multiplier: 60, timespan: 'minute', interval: '60min' },
  daily: { multiplier: 1, timespan: 'day', interval: '1day' },
  weekly: { multiplier: 1, timespan: 'week', interval: '1week' },
  monthly: { multiplier: 1, timespan: 'month', interval: '1month' },
  yearly: { multiplier: 1, timespan: 'year', interval: '1day' },
};

const MarketTrends = () => {
  const [config, setConfig] = useState<Config>({
    symbol: 'SPY',
    timeframe: 'daily',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateIndicators = (prices: number[]): { 
    sma20: number[], 
    rsi: number[], 
    macd: number[], 
    signal: number[], 
    upperBB: number[], 
    lowerBB: number[] 
  } => {
    const sma20: number[] = [];
    const rsi: number[] = [];
    const macd: number[] = [];
    const signal: number[] = [];
    const upperBB: number[] = [];
    const lowerBB: number[] = [];

    // Calculate SMA20 and Bollinger Bands
    for (let i = 0; i < prices.length; i++) {
      if (i < 19) {
        sma20.push(0);
        upperBB.push(0);
        lowerBB.push(0);
      } else {
        const slice = prices.slice(i - 19, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / 20;
        sma20.push(mean);
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        upperBB.push(mean + 2 * stdDev);
        lowerBB.push(mean - 2 * stdDev);
      }
    }

    // Calculate RSI
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    for (let i = 0; i < prices.length; i++) {
      if (i < 14) {
        rsi.push(50);
      } else {
        const slice = changes.slice(Math.max(0, i - 14), i);
        const gains = slice.filter(c => c > 0);
        const losses = slice.filter(c => c < 0).map(Math.abs);
        const avgGain = gains.length ? gains.reduce((sum, val) => sum + val, 0) / 14 : 0;
        const avgLoss = losses.length ? losses.reduce((sum, val) => sum + val, 0) / 14 : 0;
        const rs = avgLoss !== 0 ? avgGain / avgLoss : (avgGain > 0 ? 100 : 0);
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    // Calculate MACD
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    for (let i = 0; i < prices.length; i++) {
      macd.push(ema12[i] - ema26[i]);
    }
    signal.push(...calculateEMA(macd, 9));

    return { sma20, rsi, macd, signal, upperBB, lowerBB };
  };

  const calculateEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [prices[0] || 0];
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const validateDates = (start: string, end: string): boolean => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const maxDate = new Date();
    const minDate = new Date('2000-01-01');

    if (startDate > endDate) {
      setDateError('Start date must be before end date');
      return false;
    }
    if (endDate > maxDate) {
      setDateError('End date cannot be in the future');
      return false;
    }
    if (startDate < minDate) {
      setDateError('Start date is too early (data available from 2000)');
      return false;
    }
    setDateError(null);
    return true;
  };

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use only the first 5 symbols for live market data
      const liveSymbols = MARKET_SYMBOLS.slice(0, 5);

      // Check cache first
      const { data: cachedData, error: cacheError } = await supabase
        .from('live_market_data')
        .select('*')
        .in('symbol', liveSymbols)
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (!cacheError && cachedData && cachedData.length === liveSymbols.length) {
        const formattedData = cachedData.map(item => ({
          symbol: item.symbol,
          price: item.price,
          change: item.change_percent ? (item.price * item.change_percent) / 100 : 0,
          changePercent: item.change_percent || 0,
          volume: item.volume || 0,
        }));
        setMarketData(formattedData);
        setLoading(false);
        return;
      }

      // Fetch from Alpha Vantage
      const { data: freshData, error: fetchError } = await supabase.functions.invoke('alpha-vantage-market-data', {
        body: { symbols: liveSymbols },
      });

      if (fetchError) {
        console.error('Fetch error details:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch market data');
      }

      // Parse Alpha Vantage response - the edge function returns { success, data, message }
      if (freshData && freshData.success && Array.isArray(freshData.data)) {
        const formattedData = freshData.data.map((item: any) => ({
          symbol: item.symbol,
          price: item.price,
          change: (item.price * item.change_percent) / 100,
          changePercent: item.change_percent,
          volume: item.volume,
        })).filter(item => item.symbol && item.price > 0); // Filter out invalid entries

        if (formattedData.length > 0) {
          setMarketData(formattedData);
          
          // Cache the data
          await supabase.from('live_market_data').upsert(
            formattedData.map(item => ({
              symbol: item.symbol,
              price: item.price,
              change_percent: item.changePercent,
              volume: item.volume,
              timestamp: new Date().toISOString(),
              source: 'alpha_vantage',
            })),
            { onConflict: 'symbol' }
          );
        } else {
          throw new Error('No valid data returned from market data service');
        }
      } else {
        const errorMsg = freshData?.error || 'Invalid response format from market data service';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);

      // Fallback to cached data
      const { data: fallbackData } = await supabase
        .from('live_market_data')
        .select('*')
        .in('symbol', MARKET_SYMBOLS.slice(0, 5))
        .order('timestamp', { ascending: false })
        .limit(5);

      if (fallbackData && fallbackData.length > 0) {
        const formattedData = fallbackData.map(item => ({
          symbol: item.symbol,
          price: item.price,
          change: item.change_percent ? (item.price * item.change_percent) / 100 : 0,
          changePercent: item.change_percent || 0,
          volume: item.volume || 0,
        }));
        setMarketData(formattedData);
        setError(`${errorMessage} (showing cached data)`);
      }

      toast({ 
        title: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchChartData = useCallback(async () => {
    if (!validateDates(config.startDate, config.endDate)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const { data: cachedPriceData, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', config.symbol)
        .gte('date', config.startDate)
        .lte('date', config.endDate)
        .order('date', { ascending: true })
        .limit(100);

      if (!priceError && cachedPriceData && cachedPriceData.length > 10) {
        const transformedData: ChartData[] = cachedPriceData.map(item => ({
          date: item.date,
          price: item.price,
          volume: item.volume || 0,
          sma20: item.sma20 || 0,
          rsi: item.rsi || 50,
          macd: item.macd || 0,
          signal: item.signal || 0,
          upperBB: item.upperbb || 0,
          lowerBB: item.lowerbb || 0,
        }));
        setChartData(transformedData);
        setLoading(false);
        return;
      }

      // Determine Alpha Vantage function and parameters
      const functionMap: { [key: string]: string } = {
        hourly: 'TIME_SERIES_INTRADAY',
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY',
        yearly: 'TIME_SERIES_DAILY',
      };

      const requestBody: any = {
        symbol: config.symbol,
        function: functionMap[config.timeframe] || 'TIME_SERIES_DAILY',
        outputsize: 'full'
      };

      if (config.timeframe === 'hourly') {
        requestBody.interval = '60min';
      }

      const { data: chartResponse, error: chartError } = await supabase.functions.invoke('alpha-vantage-data', {
        body: requestBody,
      });

      if (chartError) {
        console.error('Chart error details:', chartError);
        throw new Error(chartError.message || 'Failed to fetch chart data');
      }

      // Parse Alpha Vantage response with robust error handling
      if (!chartResponse || typeof chartResponse !== 'object') {
        throw new Error('Invalid data format from AlphaVantage');
      }

      // Find the time series key
      const timeSeriesKey = Object.keys(chartResponse).find(key => 
        key.includes('Time Series') || key.includes('Weekly') || key.includes('Monthly')
      );

      if (!timeSeriesKey || !chartResponse[timeSeriesKey]) {
        // Check for error messages from Alpha Vantage
        if (chartResponse['Error Message']) {
          throw new Error(`AlphaVantage Error: ${chartResponse['Error Message']}`);
        }
        if (chartResponse['Note']) {
          throw new Error('API rate limit reached. Please try again in a minute.');
        }
        throw new Error('Invalid data format from AlphaVantage');
      }

      const timeSeries = chartResponse[timeSeriesKey];
      const dates = Object.keys(timeSeries).sort();
      
      if (dates.length === 0) {
        throw new Error('No data available for the selected period');
      }

      // Filter dates based on selected range
      const filteredDates = dates.filter(date => {
        const d = new Date(date);
        return d >= new Date(config.startDate) && d <= new Date(config.endDate);
      }).slice(-100); // Take last 100 data points

      if (filteredDates.length === 0) {
        throw new Error('No data available for the selected date range');
      }

      // Extract prices and calculate indicators
      const prices = filteredDates.map(date => {
        const dayData = timeSeries[date];
        return parseFloat(dayData['4. close'] || dayData['4. Close'] || dayData['close'] || '0');
      });

      const { sma20, rsi, macd, signal, upperBB, lowerBB } = calculateIndicators(prices);

      const transformedData: ChartData[] = filteredDates.map((date, index) => {
        const dayData = timeSeries[date];
        return {
          date,
          price: prices[index],
          volume: parseInt(dayData['5. volume'] || dayData['5. Volume'] || dayData['volume'] || '0'),
          sma20: sma20[index] || 0,
          rsi: rsi[index] || 50,
          macd: macd[index] || 0,
          signal: signal[index] || 0,
          upperBB: upperBB[index] || 0,
          lowerBB: lowerBB[index] || 0,
        };
      });

      setChartData(transformedData);

      // Cache the data with conflict resolution
      if (transformedData.length > 0) {
        await supabase.from('price_history').upsert(
          transformedData.map(item => ({
            symbol: config.symbol,
            date: item.date,
            price: item.price,
            volume: item.volume,
            sma20: item.sma20,
            rsi: item.rsi,
            macd: item.macd,
            signal: item.signal,
            upperbb: item.upperBB,
            lowerbb: item.lowerBB,
            timestamp: new Date().toISOString(),
          })),
          { onConflict: 'symbol,date' }
        );
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data';
      setError(errorMessage);
      
      toast({ 
        title: errorMessage,
        variant: 'destructive' 
      });

      // Try to load any available cached data as fallback
      const { data: fallbackData } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', config.symbol)
        .order('date', { ascending: true })
        .limit(30);

      if (fallbackData && fallbackData.length > 0) {
        const transformedData: ChartData[] = fallbackData.map(item => ({
          date: item.date,
          price: item.price,
          volume: item.volume || 0,
          sma20: item.sma20 || 0,
          rsi: item.rsi || 50,
          macd: item.macd || 0,
          signal: item.signal || 0,
          upperBB: item.upperbb || 0,
          lowerBB: item.lowerbb || 0,
        }));
        setChartData(transformedData);
      }
    } finally {
      setLoading(false);
    }
  }, [toast, config]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketData();
    }, 5 * 60 * 1000); // Update market data every 5 minutes

    return () => clearInterval(interval);
  }, [fetchMarketData]);

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

  const handleConfigChange = (field: keyof Config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading && marketData.length === 0) {
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
              <AlertTriangle className="h-4 w-4 inline mr-1" /> {error}
            </p>
          )}
          {dateError && (
            <p className="text-sm text-red-600 mt-1">
              <AlertTriangle className="h-4 w-4 inline mr-1" /> {dateError}
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
              fetchChartData();
            }}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Configure market analysis parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <div className="flex flex-wrap gap-2">
                {['SPY', 'QQQ', 'IWM', 'GLD', 'DIA'].map((symbol) => (
                  <Button
                    key={symbol}
                    variant={config.symbol === symbol ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigChange('symbol', symbol)}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <div className="flex flex-wrap gap-2">
                {['daily', 'weekly', 'monthly'].map((tf) => (
                  <Button
                    key={tf}
                    variant={config.timeframe === tf ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigChange('timeframe', tf)}
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => handleConfigChange('startDate', e.target.value)}
                  max={config.endDate}
                  min="2000-01-01"
                />
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min="2000-01-01"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {item.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
                    <p className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
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

          {topMovers.length > 0 && (
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
                        {item.changePercent >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Chart - {config.symbol}</CardTitle>
                  <CardDescription>{config.timeframe.charAt(0).toUpperCase() + config.timeframe.slice(1)} price movement</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <MarketChart data={chartData} error={error} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  {loading ? 'Loading chart data...' : 'No chart data available'}
                </div>
              )}
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
                  {chartData.length > 0 ? (
                    <>
                      {chartData[chartData.length - 1].volume > chartData.slice(-10, -1).reduce((a, b) => a + b.volume, 0) / 9 * 1.5 && (
                        <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                          <p className="font-medium">Volume Spike</p>
                          <p className="text-sm text-gray-600">{config.symbol} volume significantly above average</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].price > chartData[chartData.length - 1].upperBB && chartData[chartData.length - 1].upperBB > 0 && (
                        <div className="p-3 border-l-4 border-green-500 bg-green-50">
                          <p className="font-medium">Breakout Alert</p>
                          <p className="text-sm text-gray-600">{config.symbol} broke above upper Bollinger Band</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].price < chartData[chartData.length - 1].lowerBB && chartData[chartData.length - 1].lowerBB > 0 && (
                        <div className="p-3 border-l-4 border-red-500 bg-red-50">
                          <p className="font-medium">Support Test</p>
                          <p className="text-sm text-gray-600">{config.symbol} testing lower Bollinger Band</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].rsi > 70 && (
                        <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                          <p className="font-medium">Overbought Condition</p>
                          <p className="text-sm text-gray-600">RSI indicates {config.symbol} may be overbought</p>
                        </div>
                      )}
                      {chartData[chartData.length - 1].rsi < 30 && (
                        <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                          <p className="font-medium">Oversold Condition</p>
                          <p className="text-sm text-gray-600">RSI indicates {config.symbol} may be oversold</p>
                        </div>
                      )}
                      {chartData.length > 0 && (
                        chartData[chartData.length - 1].volume === 0 && 
                        chartData[chartData.length - 1].upperBB === 0 && 
                        chartData[chartData.length - 1].lowerBB === 0
                      ) && (
                        <div className="p-3 border-l-4 border-gray-500 bg-gray-50">
                          <p className="font-medium">No Active Alerts</p>
                          <p className="text-sm text-gray-600">All indicators within normal ranges</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 border-l-4 border-gray-500 bg-gray-50">
                      <p className="font-medium">No Data Available</p>
                      <p className="text-sm text-gray-600">Load chart data to see market alerts</p>
                    </div>
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
                {marketData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No sector data available
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

export default MarketTrends;
