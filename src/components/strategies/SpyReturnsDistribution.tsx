
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Calculator, Download } from 'lucide-react';

interface ReturnsData {
  range: string;
  frequency: number;
}

interface StrategyConfig {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

const SpyReturnsDistribution: React.FC = () => {
  const [config, setConfig] = useState<StrategyConfig>({
    symbol: 'SPY',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  });

  const [returnsData, setReturnsData] = useState<ReturnsData[]>([
    { range: '-5% to -4%', frequency: 12 },
    { range: '-4% to -3%', frequency: 18 },
    { range: '-3% to -2%', frequency: 25 },
    { range: '-2% to -1%', frequency: 35 },
    { range: '-1% to 0%', frequency: 50 },
    { range: '0% to 1%', frequency: 55 },
    { range: '1% to 2%', frequency: 40 },
    { range: '2% to 3%', frequency: 30 },
    { range: '3% to 4%', frequency: 20 },
    { range: '4% to 5%', frequency: 10 },
  ]);

  const [loadingData, setLoadingData] = useState(false);

  const handleConfigChange = (field: keyof StrategyConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSimulate = () => {
    setLoadingData(true);
    setTimeout(() => {
      setLoadingData(false);
    }, 1500);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{`Range: ${label}`}</p>
          <p className="text-blue-600">{`Frequency: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>SPY Returns Distribution</span>
        </CardTitle>
        <CardDescription>Analyze historical returns distribution for SPY</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Select value={config.symbol} onValueChange={(value) => handleConfigChange('symbol', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPY">SPY</SelectItem>
                <SelectItem value="QQQ">QQQ</SelectItem>
                <SelectItem value="IWM">IWM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select value={config.timeframe} onValueChange={(value) => handleConfigChange('timeframe', value)}>
              <SelectTrigger>
                <SelectValue />
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
              />
              <Input
                type="date"
                value={config.endDate}
                onChange={(e) => handleConfigChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSimulate} disabled={loadingData} className="w-full">
          {loadingData ? 'Simulating...' : 'Simulate'}
        </Button>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={returnsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="frequency" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpyReturnsDistribution;
