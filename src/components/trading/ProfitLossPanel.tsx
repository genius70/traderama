
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Share2, Calendar, DollarSign } from 'lucide-react';
import SocialShareModal from './SocialShareModal';

interface PnLData {
  date: string;
  profit: number;
  trades: number;
  winRate: number;
}

interface ProfitLossPanelProps {
  userId: string;
  userName: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

const ProfitLossPanel: React.FC<ProfitLossPanelProps> = ({ 
  userId, 
  userName, 
  timeframe = 'month' 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock P&L data - in real app this would come from backend
  const pnlData: PnLData[] = [
    { date: '2024-01-01', profit: 1250, trades: 15, winRate: 73 },
    { date: '2024-01-02', profit: 890, trades: 12, winRate: 67 },
    { date: '2024-01-03', profit: 1450, trades: 18, winRate: 78 },
    { date: '2024-01-04', profit: -320, trades: 8, winRate: 38 },
    { date: '2024-01-05', profit: 2100, trades: 22, winRate: 82 },
    { date: '2024-01-06', profit: 1680, trades: 20, winRate: 75 },
    { date: '2024-01-07', profit: 980, trades: 14, winRate: 71 }
  ];

  const totalProfit = pnlData.reduce((sum, data) => sum + data.profit, 0);
  const totalTrades = pnlData.reduce((sum, data) => sum + data.trades, 0);
  const avgWinRate = pnlData.reduce((sum, data) => sum + data.winRate, 0) / pnlData.length;
  const profitGrowth = ((pnlData[pnlData.length - 1]?.profit - pnlData[0]?.profit) / Math.abs(pnlData[0]?.profit)) * 100;

  const chartConfig = {
    profit: {
      label: 'Profit ($)',
      color: totalProfit >= 0 ? '#10b981' : '#ef4444'
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const generateShareData = () => ({
    type: 'pnl',
    userName,
    totalProfit,
    totalTrades,
    winRate: avgWinRate.toFixed(1),
    timeframe: selectedTimeframe,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total P&L</CardDescription>
            <CardTitle className={`text-2xl ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {profitGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitGrowth >= 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle className="text-2xl">{totalTrades}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Active Trader</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{avgWinRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={avgWinRate >= 70 ? "default" : "secondary"}>
              {avgWinRate >= 70 ? 'Excellent' : 'Good'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Daily</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalProfit / pnlData.length)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last 7 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Share */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Profit and loss trends over time</CardDescription>
            </div>
            <Button 
              onClick={() => setShowShareModal(true)}
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Results</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profit" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profit">Profit Trend</TabsTrigger>
              <TabsTrigger value="trades">Trade Volume</TabsTrigger>
              <TabsTrigger value="winrate">Win Rate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profit" className="space-y-4">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="var(--color-profit)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-profit)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <ChartContainer config={{ trades: { label: 'Trades', color: '#8b5cf6' } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pnlData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="trades" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="winrate" className="space-y-4">
              <ChartContainer config={{ winRate: { label: 'Win Rate (%)', color: '#f59e0b' } }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={generateShareData()}
      />
    </div>
  );
};

export default ProfitLossPanel;
