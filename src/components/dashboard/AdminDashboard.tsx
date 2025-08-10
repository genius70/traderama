import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserAnalyticsPanel from '@/components/admin/UserAnalyticsPanel';
import AdminAirdropPanel from '@/components/gamification/AdminAirdropPanel';
import StrategyApproval from '@/components/admin/StrategyApproval';
import AssetManagement from '@/components/admin/AssetManagement';
import ContactManagement from '@/components/admin/ContactManagement';
import AdminCharts from '@/components/admin/AdminCharts';
import { TrendingUp, Users, DollarSign, Activity, Mail, Target } from 'lucide-react';

// Mock metrics for overview
const mockAnalytics = {
  totalStrategies: 320,
  newStrategies: 12,
  totalTrades: 8750,
  newTrades: 230,
  revenue: 15000,
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Management Dashboard</h1>
          <p className="text-gray-600">Manage strategies, users, assets, and platform analytics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">User Analytics</TabsTrigger>
            <TabsTrigger value="strategies">Strategy Approval</TabsTrigger>
            <TabsTrigger value="airdrop">Airdrop Management</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="email">Email Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalStrategies}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockAnalytics.newStrategies} new this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalTrades.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockAnalytics.newTrades} new this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockAnalytics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                  <p className="text-xs text-muted-foreground">Active premium users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Strategies</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
            </div>
            <AdminCharts />
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
