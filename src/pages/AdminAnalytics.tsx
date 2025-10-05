import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AssetManagement from '@/components/admin/AssetManagement';
import ContactManagement from '@/components/admin/ContactManagement';
import { DollarSign, Target, TrendingUp } from "lucide-react";
import UserAnalyticsPanel from "@/components/admin/UserAnalyticsPanel";
import AdminCharts from "@/components/admin/AdminCharts";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminAnalytics = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState({
    totalStrategies: 0,
    newStrategies: 0,
    totalTrades: 0,
    newTrades: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        
        // Fetch platform analytics
        const { data: platformData, error } = await supabase
          .from('platform_analytics')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (error) throw error;

        // Calculate summary metrics
        const latestData = platformData?.[platformData.length - 1];
        const previousData = platformData?.[platformData.length - 2];
        
        setAnalytics({
          totalStrategies: latestData?.total_strategies || 0,
          newStrategies: (latestData?.new_strategies || 0),
          totalTrades: latestData?.total_trades || 0,
          newTrades: (latestData?.new_trades || 0),
          revenue: latestData?.revenue || 0,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: 'Error loading analytics',
          variant: 'destructive',
        });
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user, toast]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.email !== 'royan.shaw@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Management Dashboard</h1>
          <p className="text-gray-600">Professional platform analytics, user management and advanced trading data</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="contacts">Email Users</TabsTrigger>
          </TabsList>

          {/* OVERVIEW - core stats & advanced charts */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UserAnalyticsPanel />
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Active Strategies</span>
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.totalStrategies}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics.newStrategies} new this month
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Total Trades</span>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{analytics.totalTrades.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics.newTrades} new this month
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Platform Revenue</span>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">${analytics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Monthly recurring revenue
                  </p>
                </div>
              </Card>
            </div>
            <AdminCharts />
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <UserAnalyticsPanel />
          </TabsContent>

          {/* TRADING TAB */}
          <TabsContent value="trading">
            <Card>
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Trading analytics coming soon</p>
                  <p>Detailed trading performance metrics and IV/risk analytics will be added here.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ASSETS TAB (reuse existing) */}
          <TabsContent value="assets">
            <AssetManagement />
          </TabsContent>

          {/* CONTACTS TAB */}
          <TabsContent value="contacts">
            <ContactManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminAnalytics;
