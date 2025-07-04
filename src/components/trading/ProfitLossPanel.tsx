import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Share2 } from 'lucide-react';
import SocialShareModal from './SocialShareModal';

interface ProfitLossPanelProps {
  userName: string;
}

const ProfitLossPanel: React.FC<ProfitLossPanelProps> = ({ userName }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock data - in real app this would come from Supabase
  const mockData = {
    totalProfit: 15420.50,
    totalTrades: 127,
    winRate: 68.5,
    bestTrade: 2340.00,
    worstTrade: -890.00,
    avgTradeSize: 1850.00,
    dailyPnL: [
      { date: '2024-01-01', pnl: 450 },
      { date: '2024-01-02', pnl: -200 },
      { date: '2024-01-03', pnl: 800 },
      { date: '2024-01-04', pnl: 320 },
      { date: '2024-01-05', pnl: -150 },
      { date: '2024-01-06', pnl: 600 },
      { date: '2024-01-07', pnl: 920 }
    ],
    monthlyPnL: [
      { month: 'Jan', profit: 3200, loss: -800 },
      { month: 'Feb', profit: 4100, loss: -1200 },
      { month: 'Mar', profit: 2800, loss: -600 },
      { month: 'Apr', profit: 5200, loss: -1800 },
      { month: 'May', profit: 3900, loss: -900 },
      { month: 'Jun', profit: 4600, loss: -1100 }
    ]
  };

  const generateShareData = () => ({
    type: 'pnl' as const,
    userName: userName,
    totalProfit: mockData.totalProfit,
    totalTrades: mockData.totalTrades,
    winRate: mockData.winRate.toString(),
    timeframe: timeframe,
    timestamp: new Date().toISOString()
  });

  const isProfit = mockData.totalProfit > 0;
  const profitPercentage = ((mockData.totalProfit / (mockData.avgTradeSize * mockData.totalTrades)) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header with Share Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">P&L Analytics</h2>
          <p className="text-gray-600">Trading performance overview</p>
        </div>
        <Button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </Button>
      </div>

      {/* Timeframe Selection */}
      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as typeof timeframe)}>
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Total P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  ${mockData.totalProfit.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  {isProfit ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {profitPercentage}% overall
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.winRate}%</div>
                <div className="text-sm text-gray-600">
                  {Math.round(mockData.totalTrades * (mockData.winRate / 100))} winning trades
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.totalTrades}</div>
                <div className="text-sm text-gray-600">
                  Avg: ${mockData.avgTradeSize.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best/Worst</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="text-green-600 font-semibold">
                    +${mockData.bestTrade.toLocaleString()}
                  </div>
                  <div className="text-red-600 font-semibold">
                    ${mockData.worstTrade.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily P&L Trend</CardTitle>
                <CardDescription>Profit and loss over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockData.dailyPnL}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Profits vs losses by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.monthlyPnL}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="#10b981" />
                    <Bar dataKey="loss" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
