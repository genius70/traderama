import React, { useState, useCallback, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import ApexCharts from 'react-apexcharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

// ETF data configuration
const ETF_SYMBOLS = [
  { symbol: 'SPY', name: 'SPDR S&P 500', description: 'S&P 500 ETF', category: 'Core' },
  { symbol: 'QQQ', name: 'Invesco QQQ', description: 'NASDAQ-100 ETF', category: 'Core' },
  { symbol: 'IWM', name: 'iShares Russell 2000', description: 'Small Cap ETF', category: 'Core' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', description: 'Total Stock Market ETF', category: 'Core' },
  { symbol: 'DIA', name: 'SPDR Dow Jones', description: 'Dow Jones ETF', category: 'Core' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', description: 'Low-cost S&P 500 ETF', category: 'Core' },
  { symbol: 'XLF', name: 'Financial Select', description: 'Financial Sector ETF', category: 'Sector' },
  { symbol: 'XLK', name: 'Technology Select', description: 'Technology Sector ETF', category: 'Sector' },
  { symbol: 'XLE', name: 'Energy Select', description: 'Energy Sector ETF', category: 'Sector' },
  { symbol: 'XLV', name: 'Health Care Select', description: 'Healthcare Sector ETF', category: 'Sector' },
  { symbol: 'XLI', name: 'Industrial Select', description: 'Industrial Sector ETF', category: 'Sector' },
  { symbol: 'XLY', name: 'Consumer Discretionary', description: 'Consumer Discretionary ETF', category: 'Sector' },
  { symbol: 'XLP', name: 'Consumer Staples', description: 'Consumer Staples ETF', category: 'Sector' },
  { symbol: 'XLU', name: 'Utilities Select', description: 'Utilities Sector ETF', category: 'Sector' },
  { symbol: 'XLB', name: 'Materials Select', description: 'Materials Sector ETF', category: 'Sector' },
  { symbol: 'XLRE', name: 'Real Estate Select', description: 'Real Estate ETF', category: 'Sector' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE', description: 'Developed Markets ETF', category: 'International' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging', description: 'Emerging Markets ETF', category: 'International' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed', description: 'Developed Markets ETF', category: 'International' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging', description: 'Emerging Markets ETF', category: 'International' },
  { symbol: 'IEFA', name: 'iShares Core MSCI EAFE', description: 'Core Developed Markets', category: 'International' },
  { symbol: 'AGG', name: 'iShares Core Aggregate', description: 'US Aggregate Bond ETF', category: 'Bonds' },
  { symbol: 'BND', name: 'Vanguard Total Bond', description: 'Total Bond Market ETF', category: 'Bonds' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', description: 'Long-term Treasury ETF', category: 'Bonds' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury', description: 'Intermediate Treasury ETF', category: 'Bonds' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury', description: 'Short-term Treasury ETF', category: 'Bonds' },
  { symbol: 'VUG', name: 'Vanguard Growth', description: 'Large Cap Growth ETF', category: 'Style' },
  { symbol: 'VTV', name: 'Vanguard Value', description: 'Large Cap Value ETF', category: 'Style' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth', description: 'Large Cap Growth ETF', category: 'Style' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value', description: 'Large Cap Value ETF', category: 'Style' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', description: 'Gold ETF', category: 'Commodities' },
  { symbol: 'SLV', name: 'iShares Silver Trust', description: 'Silver ETF', category: 'Commodities' },
  { symbol: 'USO', name: 'United States Oil Fund', description: 'Crude Oil ETF', category: 'Commodities' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate', description: 'REIT ETF', category: 'Real Estate' },
  { symbol: 'ARKK', name: 'ARK Innovation', description: 'Innovation ETF', category: 'Thematic' },
  { symbol: 'ICLN', name: 'iShares Global Clean Energy', description: 'Clean Energy ETF', category: 'Thematic' },
];

// Timeframe configuration
const TIMEFRAMES = [
  { key: '5min', label: '5 Min', endpoint: 'TIME_SERIES_INTRADAY&interval=5min', days: 1 },
  { key: '15min', label: '15 Min', endpoint: 'TIME_SERIES_INTRADAY&interval=15min', days: 1 },
  { key: '30min', label: '30 Min', endpoint: 'TIME_SERIES_INTRADAY&interval=30min', days: 1 },
  { key: '60min', label: '60 Min', endpoint: 'TIME_SERIES_INTRADAY&interval=60min', days: 1 },
  { key: 'daily', label: 'Daily', endpoint: 'TIME_SERIES_DAILY', days: 30 },
  { key: 'weekly', label: 'Weekly', endpoint: 'TIME_SERIES_WEEKLY', days: 365 },
  { key: 'monthly', label: 'Monthly', endpoint: 'TIME_SERIES_MONTHLY', days: 1825 },
  { key: '1Y', label: '1 Year', endpoint: 'TIME_SERIES_MONTHLY', days: 365 },
  { key: '3Y', label: '3 Years', endpoint: 'TIME_SERIES_MONTHLY', days: 1095 },
  { key: '5Y', label: '5 Years', endpoint: 'TIME_SERIES_MONTHLY', days: 1825 },
];

// Chart types
const CHART_TYPES = ['candlestick', 'line', 'area'];

// Interfaces
interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
}

interface ChartData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20: number;
  sma50: number;
  rsi: number;
}

const ALPHA_VANTAGE_API_KEY = '111222333';

// ETF Card Component
const ETFCard: React.FC<{
  etf: typeof ETF_SYMBOLS[0];
  data: MarketData | undefined;
  onSelect: (symbol: string) => void;
  isSelected: boolean;
}> = ({ etf, data, onSelect, isSelected }) => {
  const isPositive = data ? data.change >= 0 : false;

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 border-2 ${
        isSelected ? 'border-gray-800' : 'border-gray-200 hover:border-gray-400'
      } bg-white`}
      onClick={() => onSelect(etf.symbol)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-900">{etf.symbol}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{etf.name}</CardDescription>
            <CardDescription className="text-xs text-gray-400">{etf.description}</CardDescription>
          </div>
          <div
            className={`p-2 rounded-full ${
              isPositive ? 'bg-gray-200' : 'bg-gray-300'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-gray-800" />
            ) : (
              <TrendingDown className="w-4 h-4 text-gray-800" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">${data.price.toFixed(2)}</span>
              <span
                className={`text-sm font-semibold ${
                  isPositive ? 'text-gray-700' : 'text-gray-800'
                }`}
              >
                {isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="block text-xs text-gray-500">High</span>
                <span className="font-medium">${data.high.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Low</span>
                <span className="font-medium">${data.low.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Volume: {data.volume.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Chart Component
const ChartComponent: React.FC<{
  symbol: string;
  data: ChartData[];
  chartType: string;
}> = ({ symbol, data, chartType }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  const renderCandlestickChart = () => {
    const candlestickData = data.map((item) => ({
      x: item.date,
      y: [item.open, item.high, item.low, item.close],
    }));

    const sma20Data = data.map((item) => ({
      x: item.date,
      y: item.sma20,
    }));

    const sma50Data = data.map((item) => ({
      x: item.date,
      y: item.sma50,
    }));

    const rsiData = data.map((item) => ({
      x: item.date,
      y: item.rsi,
    }));

    const options = {
      chart: {
        type: 'candlestick',
        height: 350,
        background: '#ffffff',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#6b7280',
            downward: '#1f2937',
          },
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#4b5563',
            fontSize: '10px',
          },
        },
      },
      yaxis: [
        {
          title: {
            text: 'Price',
            style: {
              color: '#4b5563',
              fontSize: '12px',
            },
          },
          labels: {
            formatter: (val: number) => `$${val.toFixed(2)}`,
            style: {
              colors: '#4b5563',
              fontSize: '10px',
            },
          },
        },
        {
          title: {
            text: 'RSI',
            style: {
              color: '#4b5563',
              fontSize: '12px',
            },
          },
          opposite: true,
          min: 0,
          max: 100,
          labels: {
            formatter: (val: number) => val.toFixed(2),
            style: {
              colors: '#4b5563',
              fontSize: '10px',
            },
          },
        },
      ],
      grid: {
        borderColor: '#e5e5e5',
        strokeDashArray: 3,
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        style: {
          fontSize: '12px',
          color: '#1f2937',
        },
      },
    };

    const series = [
      {
        name: 'Candlestick',
        type: 'candlestick',
        data: candlestickData,
      },
      {
        name: 'SMA20',
        type: 'line',
        data: sma20Data,
      },
      {
        name: 'SMA50',
        type: 'line',
        data: sma50Data,
      },
      {
        name: 'RSI',
        type: 'line',
        data: rsiData,
        yAxisIndex: 1,
      },
    ];

    return (
      <div className="h-96">
        <ApexCharts options={options} series={series} height={350} />
      </div>
    );
  };

  const renderRechartsChart = (type: 'line' | 'area') => {
    return (
      <ResponsiveContainer width="100%" height={350}>
        {type === 'area' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#4b5563' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#4b5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#1f2937',
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#1f2937"
              fill="url(#colorPrice)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sma20"
              stroke="#6b7280"
              name="SMA20"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sma50"
              stroke="#9ca3af"
              name="SMA50"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rsi"
              stroke="#374151"
              name="RSI"
              dot={false}
            />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid stroke="#e5e5e5" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#4b5563' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#4b5563' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#1f2937',
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#1f2937"
              name="Price"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sma20"
              stroke="#6b7280"
              name="SMA20"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sma50"
              stroke="#9ca3af"
              name="SMA50"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rsi"
              stroke="#374151"
              name="RSI"
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="h-96">
      {chartType === 'candlestick' ? renderCandlestickChart() : renderRechartsChart(chartType as 'line' | 'area')}
    </div>
  );
};

// Main Dashboard Component
const MarketTrends: React.FC = () => {
  const [etfData, setEtfData] = useState<Record<string, MarketData>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SPY');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('daily');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartType, setChartType] = useState<string>('line');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate technical indicators
  const calculateIndicators = useCallback(
    (data: { close: number }[]): { sma20: number[]; sma50: number[]; rsi: number[] } => {
      const sma20: number[] = [];
      const sma50: number[] = [];
      const rsi: number[] = [];

      // SMA20 and SMA50
      for (let i = 0; i < data.length; i++) {
        sma20.push(
          i < 20 ? 0 : data.slice(i - 20, i).reduce((sum, item) => sum + item.close, 0) / 20
        );
        sma50.push(
          i < 50 ? 0 : data.slice(i - 50, i).reduce((sum, item) => sum + item.close, 0) / 50
        );
      }

      // RSI
      let gains = 0;
      let losses = 0;
      for (let i = 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff > 0) gains += diff;
        else losses -= diff;

        if (i >= 14) {
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          const rs = avgGain / (avgLoss || 1);
          rsi.push(100 - 100 / (1 + rs));
          if (diff > 0) gains -= diff;
          else losses += diff;
        } else {
          rsi.push(50);
        }
      }

      return { sma20, sma50, rsi };
    },
    []
  );

  // Fetch live market data
  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = ETF_SYMBOLS.map(async (etf) => {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${etf.symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        const quote = data['Global Quote'];

        if (!quote) {
          throw new Error(`No data for ${etf.symbol}`);
        }

        const marketData: MarketData = {
          symbol: etf.symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
        };

        return marketData;
      });

      const results = await Promise.all(promises);
      const dataMap: Record<string, MarketData> = {};
      results.forEach((result) => {
        dataMap[result.symbol] = result;
      });

      setEtfData(dataMap);

      // Save to Supabase
      await supabase.from('market_data').upsert(
        results.map((item) => ({
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          change_percent: item.changePercent,
          volume: item.volume,
          high: item.high,
          low: item.low,
          updated_at: new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data from Alpha Vantage');
      toast({
        title: 'Data Error',
        description: 'Unable to fetch live market data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch historical chart data
  const fetchChartData = useCallback(
    async (symbol: string, timeframe: string) => {
      try {
        const tf = TIMEFRAMES.find((t) => t.key === timeframe);
        if (!tf) return;

        const response = await fetch(
          `https://www.alphavantage.co/query?function=${tf.endpoint}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();

        let timeSeriesKey: string;
        switch (timeframe) {
          case '5min':
          case '15min':
          case '30min':
          case '60min':
            timeSeriesKey = `Time Series (${timeframe.replace('min', 'min')})`;
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

        const prices = Object.entries(timeSeries)
          .map(([date, values]: [string, any]) => ({
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume'] || '0'),
          }))
          .slice(0, tf.days);

        const { sma20, sma50, rsi } = calculateIndicators(prices);

        const transformedChartData: ChartData[] = prices.map((item, index) => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          sma20: sma20[index],
          sma50: sma50[index],
          rsi: rsi[index],
        }));

        // Aggregate for yearly views
        if (['1Y', '3Y', '5Y'].includes(timeframe)) {
          const yearlyData: ChartData[] = [];
          const years = new Set(
            transformedChartData.map((d) => new Date(d.date).getFullYear())
          );

          years.forEach((year) => {
            const yearData = transformedChartData.filter(
              (d) => new Date(d.date).getFullYear() === year
            );
            if (yearData.length > 0) {
              const avgOpen = yearData.reduce((sum, d) => sum + d.open, 0) / yearData.length;
              const avgHigh = yearData.reduce((sum, d) => sum + d.high, 0) / yearData.length;
              const avgLow = yearData.reduce((sum, d) => sum + d.low, 0) / yearData.length;
              const avgClose = yearData.reduce((sum, d) => sum + d.close, 0) / yearData.length;
              const avgVolume = yearData.reduce((sum, d) => sum + d.volume, 0) / yearData.length;
              yearlyData.push({
                date: `${year}-01-01`,
                open: avgOpen,
                high: avgHigh,
                low: avgLow,
                close: avgClose,
                volume: avgVolume,
                sma20: yearData[yearData.length - 1].sma20,
                sma50: yearData[yearData.length - 1].sma50,
                rsi: yearData[yearData.length - 1].rsi,
              });
            }
          });
          setChartData(yearlyData);
        } else {
          setChartData(transformedChartData);
        }

        // Save to Supabase
        await supabase.from('price_history').upsert(
          transformedChartData.map((item) => ({
            symbol,
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
            sma20: item.sma20,
            sma50: item.sma50,
            rsi: item.rsi,
          }))
        );
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to fetch chart data');
        toast({
          title: 'Data Error',
          description: 'Unable to fetch historical chart data. Please try again later.',
          variant: 'destructive',
        });
      }
    },
    [toast, calculateIndicators]
  );

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

  // Get unique categories
  const categories = ['All', ...new Set(ETF_SYMBOLS.map((etf) => etf.category))];
  const filteredETFs = ETF_SYMBOLS.filter((etf) => etf.category !== 'All');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">ETF Market Overview</h2>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleTimeString()} •{' '}
              <span className="text-gray-800">● Live Data</span>
            </p>
            {error && (
              <p className="text-sm text-gray-700 mt-1">⚠️ Live data connection issue</p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-1 text-gray-800" />
              <span>Powered by Alpha Vantage</span>
            </div>
          </div>
        </div>

        {/* ETF Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredETFs.map((etf) => (
            <ETFCard
              key={etf.symbol}
              etf={etf}
              data={etfData[etf.symbol]}
              onSelect={setSelectedSymbol}
              isSelected={selectedSymbol === etf.symbol}
            />
          ))}
        </div>

        {/* Selected ETF Chart */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900">
                  {ETF_SYMBOLS.find((etf) => etf.symbol === selectedSymbol)?.name || selectedSymbol}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {TIMEFRAMES.find((t) => t.key === selectedTimeframe)?.label} Price Chart
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select ETF" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {categories.map((category) => (
                      <div key={category}>
                        {category !== 'All' && (
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500">
                            {category}
                          </div>
                        )}
                        {ETF_SYMBOLS.filter(
                          (etf) => category === 'All' || etf.category === category
                        ).map((etf) => (
                          <SelectItem
                            key={etf.symbol}
                            value={etf.symbol}
                            className="text-gray-900"
                          >
                            {etf.symbol} - {etf.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem key={tf.key} value={tf.key} className="text-gray-900">
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-full sm:w-[120px] bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Chart Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {CHART_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-gray-900">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartComponent symbol={selectedSymbol} data={chartData} chartType={chartType} />
          </CardContent>
        </Card>

        {/* Market Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(1, 5).map((category) => {
            const categoryETFs = ETF_SYMBOLS.filter((etf) => etf.category === category);
            const avgChange =
              categoryETFs.reduce((sum, etf) => {
                const data = etfData[etf.symbol];
                return sum + (data ? data.changePercent : 0);
              }, 0) / categoryETFs.length;

            return (
              <Card key={category} className="bg-white border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      avgChange >= 0 ? 'text-gray-700' : 'text-gray-800'
                    }`}
                  >
                    {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500">{categoryETFs.length} ETFs</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
