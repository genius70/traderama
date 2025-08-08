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
  data: ChartData[];
  error?: string | null;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, error }) => {
  const isValidData = Array.isArray(data) && data.every(
    item => typeof item.date === 'string' &&
            typeof item.price === 'number' &&
            typeof item.volume === 'number' &&
            typeof item.sma20 === 'number' &&
            typeof item.rsi === 'number'
  );

  if (error) {
    return (
      <div className="h-64 sm:h-80 w-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data || data.length === 0 || !isValidData) {
    return (
      <div className="h-64 sm:h-80 w-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          {isValidData && data.length === 0 ? 'No chart data available' : 'Loading chart data...'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
            name="Price"
          />
          <Area
            type="monotone"
            dataKey="sma20"
            stroke="#10B981"
            strokeWidth={1}
            fillOpacity={0}
            name="SMA20"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;
