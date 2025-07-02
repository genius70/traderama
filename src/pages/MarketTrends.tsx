import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';

// ETF data configuration - Comprehensive list for trade research
const ETF_SYMBOLS = [
  // Core Market ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500', description: 'S&P 500 ETF', category: 'Core' },
  { symbol: 'QQQ', name: 'Invesco QQQ', description: 'NASDAQ-100 ETF', category: 'Core' },
  { symbol: 'IWM', name: 'iShares Russell 2000', description: 'Small Cap ETF', category: 'Core' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', description: 'Total Stock Market ETF', category: 'Core' },
  { symbol: 'DIA', name: 'SPDR Dow Jones', description: 'Dow Jones ETF', category: 'Core' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', description: 'Low-cost S&P 500 ETF', category: 'Core' },
  
  // Sector ETFs
  { symbol: 'XLF', name: 'Financial Select', description: 'Financial Sector ETF', category: 'Sector' },
  { symbol: 'XLK', name: 'Technology Select', description: 'Technology Sector ETF', category: 'Sector' },
  { symbol: 'XLE', name: 'Energy Select', description: 'Energy Sector ETF', category: 'Sector' },
  { symbol: 'XLV', name: 'Health Care Select', description: 'Healthcare Sector ETF', category: 'Sector' },
  { symbol: 'XLI', name: 'Industrial Select', description: 'Industrial Sector ETF', category: 'Sector' },
  { symbol: 'XLY', name: 'Consumer Discretionary', description: 'Consumer Discretionary ETF', category: 'Sector' },
  { symbol: 'XLP', name: 'Consumer Staples', description: 'Consumer Staples ETF', category: 'Sector' },
  { symbol: 'XLU', name: 'Utilities Select', description: 'Utilities Sector ETF', category: 'Sector' },
  { symbol: 'XLB', name: 'Materials Select', description: 'Materials Sector ETF', category: 'Sector' },
  { symbol: 'XLRE', name: 'Real Estate Select', description: 'Real Estate Sector ETF', category: 'Sector' },
  
  // International ETFs
  { symbol: 'EFA', name: 'iShares MSCI EAFE', description: 'Developed Markets ETF', category: 'International' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging', description: 'Emerging Markets ETF', category: 'International' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed', description: 'Developed Markets ETF', category: 'International' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging', description: 'Emerging Markets ETF', category: 'International' },
  { symbol: 'IEFA', name: 'iShares Core MSCI EAFE', description: 'Core Developed Markets', category: 'International' },
  
  // Bond ETFs
  { symbol: 'AGG', name: 'iShares Core Aggregate', description: 'US Aggregate Bond ETF', category: 'Bonds' },
  { symbol: 'BND', name: 'Vanguard Total Bond', description: 'Total Bond Market ETF', category: 'Bonds' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury', description: 'Long-term Treasury ETF', category: 'Bonds' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury', description: 'Intermediate Treasury ETF', category: 'Bonds' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury', description: 'Short-term Treasury ETF', category: 'Bonds' },
  
  // Growth & Value ETFs
  { symbol: 'VUG', name: 'Vanguard Growth', description: 'Large Cap Growth ETF', category: 'Style' },
  { symbol: 'VTV', name: 'Vanguard Value', description: 'Large Cap Value ETF', category: 'Style' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth', description: 'Large Cap Growth ETF', category: 'Style' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value', description: 'Large Cap Value ETF', category: 'Style' },
  
  // Commodity & Alternative ETFs
  { symbol: 'GLD', name: 'SPDR Gold Shares', description: 'Gold ETF', category: 'Commodities' },
  { symbol: 'SLV', name: 'iShares Silver Trust', description: 'Silver ETF', category: 'Commodities' },
  { symbol: 'USO', name: 'United States Oil Fund', description: 'Crude Oil ETF', category: 'Commodities' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate', description: 'REIT ETF', category: 'Real Estate' },
  { symbol: 'ARKK', name: 'ARK Innovation', description: 'Innovation ETF', category: 'Thematic' },
  { symbol: 'ICLN', name: 'iShares Global Clean Energy', description: 'Clean Energy ETF', category: 'Thematic' }
];

// Time period options for analysis
const TIME_PERIODS = [
  { key: '1M', label: '1 Month', days: 30 },
  { key: '3M', label: '3 Months', days: 90 },
  { key: '6M', label: '6 Months', days: 180 },
  { key: '1Y', label: '1 Year', days: 365 },
  { key: '3Y', label: '3 Years', days: 1095 },
  { key: '5Y', label: '5 Years', days: 1825 }
];

// Mock API function (replace with actual Alpha Vantage API calls)
const fetchETFData = async (symbol) => {
  // Simulated data - replace with actual Alpha Vantage API call
  // const API_KEY = '8AQPB7J6D8TUCDJA';
  // const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  const basePrice = Math.random() * 400 + 100;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    price: basePrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    volume: Math.floor(Math.random() * 10000000),
    high: (basePrice + Math.abs(change) * 0.5).toFixed(2),
    low: (basePrice - Math.abs(change) * 0.5).toFixed(2),
    timestamp: new Date().toISOString()
  };
};

// Generate mock historical data for charts with different time periods
const generateHistoricalData = (symbol, days = 30) => {
  const data = [];
  const basePrice = Math.random() * 400 + 100;
  let currentPrice = basePrice;
  
  // Add more realistic price movement based on time period
  const volatility = days > 365 ? 0.02 : days > 90 ? 0.015 : 0.01;
  const trend = (Math.random() - 0.5) * 0.001; // Small overall trend
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add trend and random walk
    const dailyChange = (Math.random() - 0.5) * volatility * currentPrice;
    const trendChange = trend * currentPrice;
    currentPrice = Math.max(10, currentPrice + dailyChange + trendChange);
    
    // Add some market events for longer periods
    if (days > 365 && Math.random() < 0.02) {
      // Random market event (2% chance per day for long periods)
      currentPrice *= (0.9 + Math.random() * 0.2); // ±10% event
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 500000,
      // Add technical indicators for analysis
      sma20: data.length >= 20 ? 
        data.slice(-20).reduce((sum, item) => sum + item.price, 0) / 20 : 
        currentPrice,
      rsi: 30 + Math.random() * 40 // RSI between 30-70
    });
  }
  
  return data;
};

// ETF Card Component
const ETFCard = ({ etf, data, onSelect, isSelected }) => {
  const isPositive = parseFloat(data?.change || 0) >= 0;
  
  // Category color coding
  const getCategoryColor = (category) => {
    const colors = {
      'Core': 'bg-blue-100 text-blue-800',
      'Sector': 'bg-green-100 text-green-800',
      'International': 'bg-purple-100 text-purple-800',
      'Bonds': 'bg-yellow-100 text-yellow-800',
      'Style': 'bg-indigo-100 text-indigo-800',
      'Commodities': 'bg-orange-100 text-orange-800',
      'Real Estate': 'bg-red-100 text-red-800',
      'Thematic': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div 
      className={`w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-200'
      }`}
      onClick={() => onSelect(etf.symbol)}
    >
      <div className="flex justify-between items-start mb-3 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{etf.symbol}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(etf.category)}`}>
              {etf.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{etf.name}</p>
          <p className="text-xs text-gray-500 truncate">{etf.description}</p>
        </div>
        <div className={`p-2 rounded-full flex-shrink-0 ml-2 ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          {isPositive ? 
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> : 
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          }
        </div>
      </div>
      
      {data ? (
        <div className="space-y-2 w-full">
          <div className="flex justify-between items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">${data.price}</span>
            <div className={`text-xs sm:text-sm font-semibold truncate ml-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{data.change} ({isPositive ? '+' : ''}{data.changePercent}%)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 w-full">
            <div className="min-w-0">
              <span className="block text-xs text-gray-500">High</span>
              <span className="font-medium truncate">${data.high}</span>
            </div>
            <div className="min-w-0">
              <span className="block text-xs text-gray-500">Low</span>
              <span className="font-medium truncate">${data.low}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 truncate w-full">
            Volume: {data.volume?.toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="animate-pulse w-full">
          <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
        </div>
      )}
    </div>
  );
};

// Chart Component
const ChartComponent = ({ symbol, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 sm:h-80 w-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            stroke="#6B7280"
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            stroke="#6B7280"
            domain={['dataMin - 5', 'dataMax + 5']}
            width={60}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
            formatter={(value) => [`${value}`, 'Price']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Dashboard Component
const MarketTrends = () => {
  const [etfData, setEtfData] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Get unique categories for filtering
  const categories = ['All', ...new Set(ETF_SYMBOLS.map(etf => etf.category))];
  
  // Filter ETFs by category
  const filteredETFs = categoryFilter === 'All' 
    ? ETF_SYMBOLS 
    : ETF_SYMBOLS.filter(etf => etf.category === categoryFilter);

  // Fetch ETF data
  useEffect(() => {
    const fetchAllETFData = async () => {
      setLoading(true);
      try {
        const promises = ETF_SYMBOLS.map(etf => fetchETFData(etf.symbol));
        const results = await Promise.all(promises);
        
        const dataMap = {};
        results.forEach(result => {
          dataMap[result.symbol] = result;
        });
        
        setEtfData(dataMap);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching ETF data:', error);
      }
      setLoading(false);
    };

    fetchAllETFData();
    
    // Update data every 30 seconds
    const interval = setInterval(fetchAllETFData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chart data for selected symbol and period
  useEffect(() => {
    if (selectedSymbol && selectedPeriod) {
      const period = TIME_PERIODS.find(p => p.key === selectedPeriod);
      const data = generateHistoricalData(selectedSymbol, period.days);
      setChartData(prev => ({
        ...prev,
        [`${selectedSymbol}_${selectedPeriod}`]: data
      }));
    }
  }, [selectedSymbol, selectedPeriod]);

  const currentChartData = chartData[`${selectedSymbol}_${selectedPeriod}`] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="w-full sm:w-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ETF Market Overview</h2>
            <p className="text-gray-600">
              Last updated: {lastUpdate.toLocaleTimeString()} • 
              <span className="ml-1 text-green-600">● Live Data</span>
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 w-full sm:w-auto justify-start sm:justify-end">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-1" />
              <span>Powered by Alpha Vantage</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 w-full">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category} ({category === 'All' ? ETF_SYMBOLS.length : ETF_SYMBOLS.filter(etf => etf.category === category).length})
              </button>
            ))}
          </div>
        </div>

        {/* ETF Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {filteredETFs.map(etf => (
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
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 w-full">
            <div className="w-full lg:w-auto">
              <h3 className="text-xl font-bold text-gray-900">
                {ETF_SYMBOLS.find(etf => etf.symbol === selectedSymbol)?.name || selectedSymbol}
              </h3>
              <p className="text-gray-600">
                {TIME_PERIODS.find(p => p.key === selectedPeriod)?.label} Price Chart
              </p>
            </div>
            
            {/* Time Period Selector */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {TIME_PERIODS.map(period => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.key}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full">
            <ChartComponent 
              symbol={selectedSymbol} 
              data={currentChartData}
              period={selectedPeriod}
            />
          </div>
        </div>

        {/* Market Summary Stats */}
        <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(1, 5).map(category => {
            const categoryETFs = ETF_SYMBOLS.filter(etf => etf.category === category);
            const avgChange = categoryETFs.reduce((sum, etf) => {
              const data = etfData[etf.symbol];
              return sum + (data ? parseFloat(data.changePercent) : 0);
            }, 0) / categoryETFs.length;
            
            return (
              <div key={category} className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
                <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </div>
                <p className="text-xs text-gray-500">{categoryETFs.length} ETFs</p>
              </div>
            );
          })}
        </div>

        {/* API Integration Instructions */}
        <div className="mt-8 w-full bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h4 className="font-bold text-blue-900 mb-2">🔧 Alpha Vantage Integration</h4>
          <p className="text-blue-800 text-sm mb-2">
            To use real data, replace the mock API function with actual Alpha Vantage calls:
          </p>
          <code className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-900 block w-full overflow-x-auto">
            https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=YOUR_API_KEY
          </code>
          <p className="text-blue-700 text-xs mt-2">
            Sign up at alphavantage.co for free API access (500 calls/day) • Use TIME_SERIES_DAILY for historical data
          </p>
        </div>
      </div>
    </div>
  );
};:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {ETF_SYMBOLS.map(etf => (
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
        <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 w-full">
            <div className="w-full sm:w-auto">
              <h3 className="text-xl font-bold text-gray-900">
                {ETF_SYMBOLS.find(etf => etf.symbol === selectedSymbol)?.name || selectedSymbol}
              </h3>
              <p className="text-gray-600">30-Day Price Chart</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 w-full sm:w-auto justify-start sm:justify-end">
              <DollarSign className="w-4 h-4" />
              <span>Price Movement</span>
            </div>
          </div>
          
          <div className="w-full">
            <ChartComponent 
              symbol={selectedSymbol} 
              data={chartData[selectedSymbol]} 
            />
          </div>
        </div>

        {/* API Integration Instructions */}
        <div className="mt-8 w-full bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h4 className="font-bold text-blue-900 mb-2">🔧 MARKET TREND HISTORY</h4>
          <p className="text-blue-800 text-sm mb-2">
            Get live market data, Alpha Vantage calls:
          </p>
          <code className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-900 block w-full overflow-x-auto">
            https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${API_KEY}
          </code>
          <p className="text-blue-700 text-xs mt-2">
            Interested in Influencer Marketing? You can make millions as an Influencer Marketer at Fanorama.pro
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
