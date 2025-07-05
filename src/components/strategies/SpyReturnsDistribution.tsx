import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  Calculator,
  Download,
} from "lucide-react";

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

interface TooltipPayload {
  value: number;
  payload: ReturnsData;
}

interface StatisticsCardProps {
  title: string;
  value: string;
  description: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  description,
}) =>
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
      </div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>;

const SpyReturnsDistribution: React.FC = () => {
  const [config, setConfig] = useState<StrategyConfig>({
    symbol: "SPY",
    timeframe: "1d",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  });

  // Sample data for SPY returns distribution
  const [returnsData, setReturnsData] = useState<ReturnsData[]>([
    { range: "-10% to -5%", frequency: 5, percentage: 2.1 },
    { range: "-5% to -3%", frequency: 12, percentage: 5.0 },
    { range: "-3% to -1%", frequency: 28, percentage: 11.7 },
    { range: "-1% to 0%", frequency: 45, percentage: 18.8 },
    { range: "0% to 1%", frequency: 52, percentage: 21.7 },
    { range: "1% to 3%", frequency: 38, percentage: 15.8 },
    { range: "3% to 5%", frequency: 25, percentage: 10.4 },
    { range: "5% to 10%", frequency: 18, percentage: 7.5 },
    { range: "10%+", frequency: 12, percentage: 5.0 },
  ]);

  const [loadingData, setLoadingData] = useState(false);

  const performance = {
    annualReturn: 12.5,
    volatility: 18.2,
    sharpeRatio: 0.68,
    maxDrawdown: -23.4,
  };

  const handleConfigChange = (field: keyof StrategyConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const handleSimulate = () => {
    setLoadingData(true);
    setTimeout(() => {
      setLoadingData(false);
    }, 1500);
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
          <p className="text-blue-600">{`Frequency: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          SPY Returns Distribution Analysis
        </h2>
        <p className="text-gray-600">
          Historical daily returns distribution for S&P 500 ETF (SPY)
        </p>
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
                onValueChange={value => handleConfigChange("symbol", value)}
              >
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
              <Select
                value={config.timeframe}
                onValueChange={value => handleConfigChange("timeframe", value)}
              >
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
                  onChange={e =>
                    handleConfigChange("startDate", e.target.value)}
                />
                <Input
                  type="date"
                  value={config.endDate}
                  onChange={e => handleConfigChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSimulate}
            disabled={loadingData}
            className="w-full"
          >
            {loadingData ? "Simulating..." : "Simulate"}
          </Button>
        </CardContent>
      </Card>

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
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "frequency" ? `${value} days` : `${value}%`,
                    name === "frequency" ? "Frequency" : "Percentage",
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
              <h4 className="font-semibold text-sm text-gray-700">
                Normal Distribution
              </h4>
              <p className="text-sm text-gray-600">
                SPY returns approximately follow a normal distribution with
                slight negative skew during market stress periods.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">
                Risk Management
              </h4>
              <p className="text-sm text-gray-600">
                About 68% of daily returns fall within ±1% range, making it
                suitable for various options strategies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">Tail Risk</h4>
              <p className="text-sm text-gray-600">
                Extreme moves (5%) or more occur approximately 12.5% of the time,
                highlighting the importance of position sizing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-700">
                Trading Opportunities
              </h4>
              <p className="text-sm text-gray-600">
                The predictable distribution pattern creates opportunities for
                systematic options trading strategies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpyReturnsDistribution;
