import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserGrowthData {
  month: string; // Format: 'YYYY-MM'
  users: number;
  trades: number;
}

interface TradePerformanceData {
  month: string; // Format: 'YYYY-MM'
  returns: number;
  volume: number;
}

const AdminCharts: React.FC = () => {
  const { toast } = useToast();
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [tradePerformanceData, setTradePerformanceData] = useState<TradePerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch user growth data
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at')
          .gte('created_at', sixMonthsAgo.toISOString());
        if (profilesError) throw profilesError;

        const { data: tradesData, error: tradesError } = await supabase
          .from('iron_condor_trades')
          .select('id, opened_at')
          .gte('opened_at', sixMonthsAgo.toISOString());
        if (tradesError) throw tradesError;

        // Aggregate user growth and trades by month
        const userGrowthByMonth: { [key: string]: UserGrowthData } = {};
        for (let i = 0; i < 6; i++) {
          const date = new Date(sixMonthsAgo);
          date.setMonth(sixMonthsAgo.getMonth() + i);
          const month = date.toISOString().slice(0, 7); // YYYY-MM
          userGrowthByMonth[month] = { month, users: 0, trades: 0 };
        }

        profilesData.forEach((profile) => {
          if (profile.created_at) {
            const month = new Date(profile.created_at).toISOString().slice(0, 7);
            if (userGrowthByMonth[month]) {
              userGrowthByMonth[month].users += 1;
            }
          }
        });

        tradesData.forEach((trade) => {
          if (trade.opened_at) {
            const month = new Date(trade.opened_at).toISOString().slice(0, 7);
            if (userGrowthByMonth[month]) {
              userGrowthByMonth[month].trades += 1;
            }
          }
        });

        const userGrowthData = Object.values(userGrowthByMonth);
        setUserGrowthData(userGrowthData);

        // Fetch trade performance data from iron condor trades
        const { data: tradesWithProfit, error: tradesProfitError } = await supabase
          .from('iron_condor_trades')
          .select('id, opened_at, current_pnl')
          .gte('opened_at', sixMonthsAgo.toISOString());
        if (tradesProfitError) throw tradesProfitError;

        const tradePerformanceByMonth: { [key: string]: TradePerformanceData } = {};
        for (let i = 0; i < 6; i++) {
          const date = new Date(sixMonthsAgo);
          date.setMonth(sixMonthsAgo.getMonth() + i);
          const month = date.toISOString().slice(0, 7);
          tradePerformanceByMonth[month] = { month, returns: 0, volume: 0 };
        }

        tradesWithProfit.forEach((trade) => {
          if (trade.opened_at) {
            const month = new Date(trade.opened_at).toISOString().slice(0, 7);
            if (tradePerformanceByMonth[month]) {
              tradePerformanceByMonth[month].volume += 1; // Count trades as volume
              tradePerformanceByMonth[month].returns += trade.current_pnl || 0;
            }
          }
        });

        // Calculate average returns per month
        Object.keys(tradePerformanceByMonth).forEach((month) => {
          const tradeCount = tradePerformanceByMonth[month].volume;
          tradePerformanceByMonth[month].returns =
            tradeCount > 0 ? tradePerformanceByMonth[month].returns / tradeCount : 0;
        });

        const tradePerformanceData = Object.values(tradePerformanceByMonth);
        setTradePerformanceData(tradePerformanceData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        toast({ title: 'Error fetching chart data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [toast]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly new user registrations and trade counts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  name="Users"
                  yAxisId="left"
                />
                <Line
                  type="monotone"
                  dataKey="trades"
                  stroke="#f43f5e"
                  yAxisId="right"
                  dot={{ r: 4 }}
                  name="Trades"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Trading Volume & Returns</CardTitle>
          <CardDescription>Monthly trading volume and average returns</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tradePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis orientation="right" yAxisId="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="volume" fill="#14b8a6" name="Volume" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="returns"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Returns ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
