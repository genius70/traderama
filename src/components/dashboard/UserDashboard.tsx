import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Users, AlertTriangle, Trophy, Clock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

const UserDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium, subscriptionTier, expiresAt, loading: loadingPremium } = usePremiumStatus();
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    activeStrategies: 0,
  });
  const [dailyPnL] = useState([
    { date: '2024-01-01', pnl: 450 },
    { date: '2024-01-02', pnl: -200 },
    { date: '2024-01-03', pnl: 800 },
    { date: '2024-01-04', pnl: 320 },
    { date: '2024-01-05', pnl: -150 },
    { date: '2024-01-06', pnl: 600 },
    { date: '2024-01-07', pnl: 920 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Mock stats - in real app, these would come from actual trade data
        setStats({
          totalTrades: 127,
          winRate: 68.5,
          totalPnL: 15420.50,
          activeStrategies: 3,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error loading stats",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [user, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Dashboard</h2>
          <p className="text-gray-600">Your trading overview and analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          {isPremium ? (
            <Badge variant="default">Premium Account</Badge>
          ) : loadingPremium ? (
            <Badge variant="secondary">Checking Premium...</Badge>
          ) : (
            <Button>Upgrade to Premium</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
            <p className="text-xs text-gray-600">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalPnL.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">All time profit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStrategies}</div>
            <p className="text-xs text-gray-600">Currently following</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>P&L Chart</CardTitle>
            <CardDescription>Daily profit and loss over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Insights</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Avg. Daily Profit</span>
              <span className="font-medium text-green-600">+$325</span>
            </div>
            <div className="flex justify-between">
              <span>Best Performing Strategy</span>
              <span className="font-medium">Iron Condor</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Score</span>
              <span className="font-medium">72/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Risk Assessment
              </CardTitle>
              <CardDescription>Your current risk exposure</CardDescription>
            </div>
            <Badge variant="destructive">High Risk</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Portfolio Utilization</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Max Drawdown</span>
                <span className="font-medium">12.5%</span>
              </div>
              <Progress value={12.5} className="h-2" />
            </div>
            <p className="text-sm text-gray-600">
              Consider reducing your exposure or diversifying your portfolio to
              lower your risk.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
