import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, AlertTriangle, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReturnsData {
  range: string;
  frequency: number;
  percentage?: number;
}

interface StrategyConfig {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

interface PerformanceMetrics {
  annualReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

interface TooltipPayload {
  value: number;
  payload: ReturnsData;
}

interface StatisticsCardProps {
  title: string;
  value: string;
  description: string;
}

interface PriceData {
  close: number;
  date: string;
}

// Define all 20 available symbols as a constant
const AVAILABLE_SYMBOLS = [
  'SPY', 'QQQ', 'IWM', 'VIX', 'GLD', 'DIA', 'EEM', 'TLT', 
  'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLP', 'XLY', 'XLU', 
  'XLB', 'XLRE', 'XLC', 'SMH'
];

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  description,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const SpyReturnsDistribution: React.FC = () => {
  const { toast } = useToast();
  
  // Set default date range (last 12 months)
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  const defaultStartDate = new Date(today.setFullYear(today.getFullYear() - 1))
    .toISOString()
    .split('T')[0];

  const [config, setConfig] = useState<StrategyConfig>({
    symbol: 'SPY',
    timeframe: '1d',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  const [returnsData, setReturnsData] = useState<ReturnsData[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Validate date inputs
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

  // Process price data and calculate returns distribution
  const processPriceData = (priceData: PriceData[]) => {
    if (priceData.length < 2) {
      throw new Error('Insufficient data points for analysis');
    }

    // Calculate returns
    const returns = priceData
      .slice(1)
      .map((current, index) => {
        const previous = priceData[index];
        return ((current.close - previous.close) / previous.close) * 100;
      })
      .filter(r => !isNaN(r) && isFinite(r));

    if (returns.length === 0) {
      throw new Error('Unable to calculate returns from price data');
    }

    // Create returns distribution bins
    const bins = [
      { range: '<-10%', min: -Infinity, max: -10 },
      { range: '-10% to -5%', min: -10, max: -5 },
      { range: '-5% to -3%', min: -5, max: -3 },
      { range: '-3% to -1%', min: -3, max: -1 },
      { range: '-1% to 0%', min: -1, max: 0 },
      { range: '0% to 1%', min: 0, max: 1 },
      { range: '1% to 3%', min: 1, max: 3 },
      { range: '3% to 5%', min: 3, max: 5 },
      { range: '5% to 10%', min: 5, max: 10 },
      { range: '>10%', min: 10, max: Infinity },
    ];

    const distribution = bins.map((bin) => {
      const frequency = returns.filter(
        (r: number) => r > bin.min && r <= bin.max
      ).length;
      const percentage = returns.length ? (frequency / returns.length) * 100 : 0;
      return { range: bin.range, frequency, percentage };
    });

    setReturnsData(distribution);

    // Calculate performance metrics
    const meanReturn = returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length;
    const periodsPerYear = config.timeframe === '1d' ? 252 : config.timeframe === '1w' ? 52 : 12;
    const annualReturn = meanReturn * periodsPerYear;
    
    const variance = returns.reduce(
      (sum: number, r: number) => sum + Math.pow(r - meanReturn, 2),
      0
    ) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(periodsPerYear);
    const sharpeRatio = volatility ? annualReturn / volatility : 0;
    
    // Calculate max drawdown
    let peak = priceData[0].close;
    let maxDD = 0;
    priceData.forEach(item => {
      if (item.close > peak) {
        peak = item.close;
      }
      const drawdown = ((item.close - peak) / peak) * 100;
      if (drawdown < maxDD) {
        maxDD = drawdown;
      }
    });

    setPerformance({
      annualReturn: parseFloat(annualReturn.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      maxDrawdown: parseFloat(maxDD.toFixed(2)),
    });
  };

  // Fetch market data from Alpha Vantage API
  const fetchMarketData = async () => {
    if (!validateDates(config.startDate, config.endDate)) {
      return;
    }

    setLoadingData(true);
    setError(null);

    try {
      // Check cache first
      const { data: cachedData, error: cacheError } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', config.symbol)
        .gte('date', config.startDate)
        .lte('date', config.endDate)
        .order('date', { ascending: true });

      if (!cacheError && cachedData && cachedData.length > 30) {
        // Use cached data if we have sufficient data points
        processPriceData(cachedData.map(item => ({
          close: item.price,
          date: item.date
        })));
        setLoadingData(false);
        return;
      }

      // Determine Alpha Vantage function based on timeframe
      const functionMap: { [key: string]: string } = {
        '1d': 'TIME_SERIES_DAILY',
        '1w': 'TIME_SERIES_WEEKLY',
        '1m': 'TIME_SERIES_MONTHLY',
      };
      
      const requestBody: any = {
        symbol: config.symbol,
        function: functionMap[config.timeframe] || 'TIME_SERIES_DAILY',
        outputsize: 'full'
      };

      const { data: alphaData, error: alphaError } = await supabase.functions.invoke('alpha-vantage-data', {
        body: requestBody,
      });

      if (alphaError) {
        console.error('Alpha Vantage error:', alphaError);
        throw new Error(alphaError.message || 'Failed to fetch market data');
      }

      // Parse Alpha Vantage response with robust error handling
      if (!alphaData || typeof alphaData !== 'object') {
        throw new Error('Invalid data format from AlphaVantage');
      }

      // Check for API errors
      if (alphaData['Error Message']) {
        throw new Error(`AlphaVantage Error: ${alphaData['Error Message']}`);
      }
      if (alphaData['Note']) {
        throw new Error('API rate limit reached. Please try again in a minute.');
      }

      // Find the time series key
      const timeSeriesKey = Object.keys(alphaData).find(key => 
        key.includes('Time Series') || key.includes('Weekly') || key.includes('Monthly')
      );

      if (!timeSeriesKey || !alphaData[timeSeriesKey]) {
        throw new Error('No valid time series data returned from Alpha Vantage');
      }

      const timeSeries = alphaData[timeSeriesKey];
      const dates = Object.keys(timeSeries).sort();
      
      if (dates.length === 0) {
        throw new Error('No data available for the selected period');
      }

      // Filter dates based on selected range
      const filteredDates = dates.filter(date => {
        const d = new Date(date);
        return d >= new Date(config.startDate) && d <= new Date(config.endDate);
      });

      if (filteredDates.length < 2) {
        throw new Error('Insufficient data points in the selected date range. Please select a wider range.');
      }

      // Extract prices
      const priceData: PriceData[] = filteredDates.map(date => {
        const dayData = timeSeries[date];
        return {
          close: parseFloat(dayData['4. close'] || dayData['4. Close'] || dayData['close'] || '0'),
          date
        };
      }).filter(item => item.close > 0);

      if (priceData.length < 2) {
        throw new Error('Unable to extract valid price data');
      }

      // Process the data
      processPriceData(priceData);

      // Cache the data
      await supabase.from('price_history').upsert(
        priceData.map(item => ({
          symbol: config.symbol,
          date: item.date,
          price: item.close,
          volume: 0,
          sma20: 0,
          rsi: 50,
          macd: 0,
          signal: 0,
          upperbb: 0,
          lowerbb: 0,
          timestamp: new Date().toISOString(),
        })),
        { onConflict: 'symbol,date' }
      );

      toast({
        title: `Data Loaded: Analyzed ${priceData.length} data points for ${config.symbol}`,
      });

    } catch (err: any) {
      console.error('Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      setReturnsData([]);
      setPerformance(null);

      toast({
        title: errorMessage,
        variant: 'destructive'
      });

      // Try to load any cached data as fallback
      const { data: fallbackData } = await supabase
        .from('price_history')
        .select('*')
        .eq('symbol', config.symbol)
        .order('date', { ascending: true })
        .limit(365);

      if (fallbackData && fallbackData.length > 30) {
        try {
          processPriceData(fallbackData.map(item => ({
            close: item.price,
            date: item.date
          })));
          setError(`${errorMessage} (showing cached data)`);
        } catch (fallbackErr) {
          console.error('Fallback processing error:', fallbackErr);
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (config.symbol && config.timeframe && config.startDate && config.endDate) {
      fetchMarketData();
    }
  }, [config.symbol, config.timeframe, config.startDate, config.endDate]);

  const handleConfigChange = (field: keyof StrategyConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSimulate = () => {
    fetchMarketData();
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{`Range: ${label}`}</p>
          <p className="text-blue-600">{`Frequency: ${data.value} periods`}</p>
          <p className="text-blue-600">{`Percentage: ${data.payload.percentage?.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Returns Distribution Analysis</h2>
        <p className="text-gray-600">Historical returns distribution for selected index/ETF</p>
      </div>

      {/* Error Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {dateError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      {/* Key Statistics */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Annual Return"
            value={`${performance.annualReturn}%`}
            description="Average annual return"
          />
          <StatisticsCard
            title="Volatility"
            value={`${performance.volatility}%`}
            description="Annual volatility"
          />
          <StatisticsCard
            title="Sharpe Ratio"
            value={performance.sharpeRatio.toFixed(2)}
            description="Risk-adjusted return"
          />
          <StatisticsCard
            title="Max Drawdown"
            value={`${performance.maxDrawdown}%`}
            description="Largest peak-to-trough decline"
          />
        </div>
      )}

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Configuration</span>
          </CardTitle>
          <CardDescription>Configure analysis parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Select
                value={config.symbol}
                onValueChange={(value) => handleConfigChange('symbol', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {AVAILABLE_SYMBOLS.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={config.timeframe}
                onValueChange={(value) => handleConfigChange('timeframe', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Daily</SelectItem>
                  <SelectItem value="1w">Weekly</SelectItem>
                  <SelectItem value="1m">Monthly</SelectItem>
                </SelectContent>
              </Select>
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
                  min={config.startDate}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSimulate} disabled={loadingData || !!dateError} className="w-full">
            {loadingData ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Fetching Data...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Fetch Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Returns Distribution Chart */}
      {returnsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {config.timeframe === '1d' ? 'Daily' : config.timeframe === '1w' ? 'Weekly' : 'Monthly'} Returns Distribution
            </CardTitle>
            <CardDescription>
              Frequency distribution of returns for {config.symbol}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={returnsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="range"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="frequency" fill="#3b82f6" name="frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistical Insights */}
      {returnsData.length > 0 && performance && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Normal Distribution</h4>
                <p className="text-sm text-gray-600">
                  {config.symbol} returns approximately follow a normal distribution with
                  slight negative skew during market stress periods.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Risk Management</h4>
                <p className="text-sm text-gray-600">
                  About {(
                    (returnsData.find((d) => d.range === '-1% to 0%')?.percentage || 0) +
                    (returnsData.find((d) => d.range === '0% to 1%')?.percentage || 0)
                  ).toFixed(0)}% of {config.timeframe === '1d' ? 'daily' : config.timeframe === '1w' ? 'weekly' : 'monthly'} returns fall within ±1% range, making it
                  suitable for various options strategies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Tail Risk</h4>
                <p className="text-sm text-gray-600">
                  Extreme moves (±5% or more) occur approximately{' '}
                  {(
                    (returnsData.find((d) => d.range === '>10%')?.percentage || 0) +
                    (returnsData.find((d) => d.range === '5% to 10%')?.percentage || 0) +
                    (returnsData.find((d) => d.range === '<-10%')?.percentage || 0) +
                    (returnsData.find((d) => d.range === '-10% to -5%')?.percentage || 0)
                  ).toFixed(1)}% of the time, highlighting the importance of position sizing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Trading Opportunities</h4>
                <p className="text-sm text-gray-600">
                  The predictable distribution pattern with a Sharpe ratio of {performance.sharpeRatio.toFixed(2)} creates opportunities for
                  systematic options trading strategies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loadingData && returnsData.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <RefreshCcw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading market data for {config.symbol}...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loadingData && returnsData.length === 0 && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <BarChart3 className="h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Click "Fetch Data" to load returns distribution</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpyReturnsDistribution;
