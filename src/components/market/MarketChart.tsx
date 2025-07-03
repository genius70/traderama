
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface ChartData {
  date: string;
  price: number;
  volume: number;
  sma20: number;
  rsi: number;
}

interface MarketChartProps {
  symbol: string;
  data: ChartData[];
}

const MarketChart: React.FC<MarketChartProps> = ({ symbol, data }) => {
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

export default MarketChart;
