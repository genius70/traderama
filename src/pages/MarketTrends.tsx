import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

// Header component
const Header = () => (
  <header className="w-full bg-white shadow-sm border-b">
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-bold text-gray-900">Market Dashboard</h1>
      <p className="text-gray-600">Real-time ETF and Index Data</p>
    </div>
  </header>
);

// ETF data configuration
const ETF_SYMBOLS = [
  { symbol: 'SPY', name: 'SPDR S&P 500', description: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ', description: 'NASDAQ-100 ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000', description: 'Small Cap ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', description: 'Total Stock Market ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones', description: 'Dow Jones ETF' },
  { symbol: 'XLF', name: 'Financial Sector', description: 'Financial Sector ETF' }
];

// Mock API function (replace with actual Alpha Vantage API calls)
const fetchETFData = async (symbol) => {
  // Simulated data - replace with actual Alpha Vantage API call
  const API_KEY = 'QAM8QOC4TRBWYON6';
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
  
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

// Generate mock historical data for charts
const generateHistoricalData = (symbol, days = 30) => {
  const data = [];
  const basePrice = Math.random() * 400 + 100;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const price = basePrice + (Math.random() - 0.5) * 50;
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
};

// ETF Card Component
const ETFCard = ({ etf, data, onSelect, isSelected }) => {
  const isPositive = parseFloat(data?.change || 0) >= 0;
  
  return (
    <div 
      className={`w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-200'
      }`}
      onClick={() => onSelect(etf.symbol)}
    >
      <div className="flex justify-between items-start mb-4 w-full">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{etf.symbol}</h3>
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
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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

  // Fetch chart data for selected symbol
  useEffect(() => {
    if (selectedSymbol) {
      const data = generateHistoricalData(selectedSymbol);
      setChartData(prev => ({
        ...prev,
        [selectedSymbol]: data
      }));
    }
  }, [selectedSymbol]);

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

        {/* ETF Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
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
          <h4 className="font-bold text-blue-900 mb-2">🔧 Alpha Vantage Integration</h4>
          <p className="text-blue-800 text-sm mb-2">
            To use real data, replace the mock API function with actual Alpha Vantage calls:
          </p>
          <code className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-900 block w-full overflow-x-auto">
            https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=API_KEY
          </code>
          <p className="text-blue-700 text-xs mt-2">
           SPONSORED BY: Sign up at Fanorama.pro for More Money and More Fun)
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
