
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for SPY returns distribution
const returnsData = [
  { range: '-10% to -5%', frequency: 5, percentage: 2.1 },
  { range: '-5% to -3%', frequency: 12, percentage: 5.0 },
  { range: '-3% to -1%', frequency: 28, percentage: 11.7 },
  { range: '-1% to 0%', frequency: 45, percentage: 18.8 },
  { range: '0% to 1%', frequency: 52, percentage: 21.7 },
  { range: '1% to 3%', frequency: 38, percentage: 15.8 },
  { range: '3% to 5%', frequency: 25, percentage: 10.4 },
  { range: '5% to 10%', frequency: 18, percentage: 7.5 },
  { range: '10%+', frequency: 12, percentage: 5.0 }
];

interface StatisticsCardProps {
  title: string;
  value: string;
  description: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, value, description }) => (
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
  const performance = {
    annualReturn: 12.5,
    volatility: 18.2,
    sharpeRatio: 0.68,
    maxDrawdown: -23.4
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SPY Returns Distribution Analysis</h2>
        <p className="text-gray-600">Historical daily returns distribution for S&P 500 ETF (SPY)</p>
      </div>

      {/* Key Statistics */}
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
          value={performance.sharpeRatio.toString()}
          description="Risk-adjusted return"
        />
        <StatisticsCard
          title="Max Drawdown"
          value={`${performance.maxDrawdown}%`}
          description="Largest peak-to-trough decline"
        />
      </div>

      {/* Returns Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Returns Distribution</CardTitle>
          <CardDescription>
            Frequency distribution of daily returns over the past 5 years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'frequency' ? `${value} days` : `${value}%`,
                    name === 'frequency' ? 'Frequency' : 'Percentage'
                  ]}
                />
                <Bar dataKey="frequency" fill="#3b82f6" name="frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Normal Distribution</h4>
              <p className="text-sm text-gray-600">
                SPY returns approximately follow a normal distribution with slight negative skew during market stress periods.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Risk Management</h4>
              <p className="text-sm text-gray-600">
                About 68% of daily returns fall within ±1% range, making it suitable for various options strategies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Tail Risk</h4>
              <p className="text-sm text-gray-600">
                Extreme moves (>5%) occur approximately 12.5% of the time, highlighting the importance of position sizing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Trading Opportunities</h4>
              <p className="text-sm text-gray-600">
                The predictable distribution pattern creates opportunities for systematic options trading strategies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpyReturnsDistribution;
