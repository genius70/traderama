import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserAnalyticsPanel from '@/components/admin/UserAnalyticsPanel';
import AdminAirdropPanel from '@/components/gamification/AdminAirdropPanel';
import StrategyApproval from '@/components/admin/StrategyApproval';
import AssetManagement from '@/components/admin/AssetManagement';
import ContactManagement from '@/components/admin/ContactManagement';
import CampaignReporting from '@/components/admin/CampaignReporting';
import AdminCharts from '@/components/admin/AdminCharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, DollarSign, Activity, Mail, Target } from 'lucide-react';

interface OverviewMetrics {
  totalStrategies: number;
  newStrategies: number;
  totalTrades: number;
  newTrades: number;
  revenue: number;
  activeSubscriptions: number;
  pendingStrategies: number;
  totalUsers: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalStrategies: 0,
    newStrategies: 0,
    totalTrades: 0,
    newTrades: 0,
    revenue: 0,
    activeSubscriptions: 0,
    pendingStrategies: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch total and new strategies
        const { data: strategies, error: strategiesError } = await supabase
          .from('trading_strategies')
          .select('id, created_at, status');
        if (strategiesError) throw strategiesError;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalStrategies = strategies.length;
        const newStrategies = strategies.filter(
          (s) => s.created_at && new Date(s.created_at) >= thirtyDaysAgo
        ).length;
        const pendingStrategies = strategies.filter((s) => s.status === 'pending_review').length;

        // Fetch total and new trades from iron condor trades
        const { data: trades, error: tradesError } = await supabase
          .from('iron_condor_trades')
          .select('id, opened_at');
        if (tradesError) throw tradesError;

        const totalTrades = trades.length;
        const newTrades = trades.filter(
          (t) => t.opened_at && new Date(t.opened_at) >= thirtyDaysAgo
        ).length;

        // Calculate revenue from strategy subscriptions
        const { data: subscriptionFees, error: subscriptionFeesError } = await supabase
          .from('strategy_subscriptions')
          .select('fees_paid');
        if (subscriptionFeesError) throw subscriptionFeesError;

        const revenue = subscriptionFees.reduce(
          (sum, s) => sum + (s.fees_paid || 0),
          0
        );

        // Count strategy subscriptions as active subscriptions
        const activeSubscriptions = subscriptionFees.length;

        // Fetch total users
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id');
        if (usersError) throw usersError;

        const totalUsers = users.length;

        setMetrics({
          totalStrategies,
          newStrategies,
          totalTrades,
          newTrades,
          revenue,
          activeSubscriptions,
          pendingStrategies,
          totalUsers,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast({ title: 'Error fetching dashboard metrics', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Management Dashboard
          </h1>
          <p className="text-gray-600">Manage strategies, users, assets, and platform analytics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">User Analytics</TabsTrigger>
            <TabsTrigger value="strategies">Strategy Approval</TabsTrigger>
            <TabsTrigger value="airdrop">Airdrop Management</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="email">Email Users</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {loading ? (
              <div className="text-center p-8">Loading metrics...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.totalStrategies}</div>
                      <p className="text-xs text-muted-foreground">
                        +{metrics.newStrategies} new this month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.totalTrades.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        +{metrics.newTrades} new this month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
                      <p className="text-xs text-muted-foreground">Active premium users</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Strategies</CardTitle>
                      <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.pendingStrategies}</div>
                      <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                  </Card>
                </div>
                <AdminCharts />
              </>
            )}
          </TabsContent>

          {/* User Analytics Tab */}
          <TabsContent value="analytics">
            <UserAnalyticsPanel />
          </TabsContent>

          {/* Strategy Approval Tab */}
          <TabsContent value="strategies">
            <StrategyApproval />
          </TabsContent>

          {/* Airdrop Management Tab */}
          <TabsContent value="airdrop">
            <AdminAirdropPanel />
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets">
            <AssetManagement />
          </TabsContent>

          {/* Email Users Tab */}
          <TabsContent value="email">
            <ContactManagement />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <CampaignReporting />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
