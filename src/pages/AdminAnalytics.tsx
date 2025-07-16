import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AssetManagement from '@/components/admin/AssetManagement';
import ContactManagement from '@/components/admin/ContactManagement';
import { DollarSign, Target, TrendingUp } from "lucide-react";
import UserAnalyticsPanel from "@/components/admin/UserAnalyticsPanel";
import AdminCharts from "@/components/admin/AdminCharts";

// Mock metrics for cards
const mockAnalytics = {
  totalStrategies: 320,
  newStrategies: 12,
  totalTrades: 8750,
  newTrades: 230,
  revenue: 15000,
};

const AdminAnalytics = () => {
  const { user, loading } = useAuth();

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
                  <div className="text-2xl font-bold">{mockAnalytics.totalStrategies}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockAnalytics.newStrategies} new this month
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Total Trades</span>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{mockAnalytics.totalTrades.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockAnalytics.newTrades} new this month
                  </p>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Platform Revenue</span>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">${mockAnalytics.revenue.toLocaleString()}</div>
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
          <TabsContent value="Email Users">
            <ContactManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminAnalytics;
