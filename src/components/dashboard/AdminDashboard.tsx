
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FeatureTracker } from '@/components/analytics/FeatureTracker';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import UserAnalyticsPanel from '@/components/admin/UserAnalyticsPanel';
import AdminCharts from '@/components/admin/AdminCharts';
import AssetManagement from '@/components/admin/AssetManagement';
import { DollarSign, Target, TrendingUp, Users, Activity, Eye, Clock, AlertTriangle, BarChart3, Settings, Database, Shield } from 'lucide-react';

// Mock metrics for cards
const mockAnalytics = {
  totalStrategies: 320,
  newStrategies: 12,
  totalTrades: 8750,
  newTrades: 230,
  revenue: 15000,
  activeUsers: 1250,
  newSignups: 45,
  errorRate: 0.2,
  avgSessionTime: 420 // seconds
};

const AdminDashboard = () => {
  const { trackFeatureUsage, trackActivity } = useAnalyticsContext();

  const handleTabChange = (tabValue: string) => {
    trackFeatureUsage(`admin_dashboard_tab_${tabValue}`);
  };

  const handleQuickAction = (action: string) => {
    trackFeatureUsage(`admin_quick_action_${action}`);
    trackActivity('admin_action', action);
  };

  return (
    <FeatureTracker featureName="admin_dashboard" trackOnUnmount>
      <div className="space-y-8">
        {/* Admin Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Admin Management Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive platform analytics, user management, and advanced trading data insights
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${mockAnalytics.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockAnalytics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{mockAnalytics.newSignups} new this month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{mockAnalytics.totalTrades.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{mockAnalytics.newTrades} new trades</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <p className="text-xs text-muted-foreground">Uptime (Error rate: {mockAnalytics.errorRate}%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Advanced Analytics
              </CardTitle>
              <CardDescription>Deep dive into platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleQuickAction('advanced_analytics')}
              >
                View Detailed Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                User Management
              </CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleQuickAction('user_management')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Database className="h-5 w-5 mr-2 text-purple-600" />
                Data Management
              </CardTitle>
              <CardDescription>Database and content management</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleQuickAction('data_management')}
              >
                Manage Data
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Security Center
              </CardTitle>
              <CardDescription>Monitor security and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-red-200"
                onClick={() => handleQuickAction('security_center')}
              >
                Security Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="trading">Trading Data</TabsTrigger>
            <TabsTrigger value="system">System Monitoring</TabsTrigger>
            <TabsTrigger value="assets">Asset Management</TabsTrigger>
          </TabsList>

          {/* OVERVIEW - Comprehensive stats & advanced charts */}
          <TabsContent value="overview" className="space-y-8">
            <FeatureTracker featureName="admin_overview_tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AdminCharts />
                </div>
                <div>
                  <UserAnalyticsPanel />
                </div>
              </div>
            </FeatureTracker>
          </TabsContent>

          {/* USER ANALYTICS TAB */}
          <TabsContent value="users">
            <FeatureTracker featureName="admin_users_tab">
              <div className="space-y-6">
                <UserAnalyticsPanel />
                
                {/* Additional User Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement Trends</CardTitle>
                      <CardDescription>Weekly active users and engagement patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Engagement analytics coming soon</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Retention Analytics</CardTitle>
                      <CardDescription>User retention and churn analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Retention metrics coming soon</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Journey</CardTitle>
                      <CardDescription>User flow and conversion funnels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Journey analytics coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FeatureTracker>
          </TabsContent>

          {/* TRADING DATA TAB */}
          <TabsContent value="trading">
            <FeatureTracker featureName="admin_trading_tab">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Volume Analytics</CardTitle>
                    <CardDescription>Detailed trading performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-gray-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Trading analytics dashboard</p>
                      <p>Comprehensive trading data analysis coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Performance</CardTitle>
                    <CardDescription>Top performing strategies and creators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-gray-500">
                      <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Strategy insights</p>
                      <p>Performance tracking and analysis tools</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FeatureTracker>
          </TabsContent>

          {/* SYSTEM MONITORING TAB */}
          <TabsContent value="system">
            <FeatureTracker featureName="admin_system_tab">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Performance</CardTitle>
                    <CardDescription>Server performance and uptime monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">System Uptime</span>
                        <span className="text-sm text-green-600 font-semibold">99.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Response Time</span>
                        <span className="text-sm text-blue-600 font-semibold">245ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Error Rate</span>
                        <span className="text-sm text-orange-600 font-semibold">{mockAnalytics.errorRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Health</CardTitle>
                    <CardDescription>Database performance and optimization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Database monitoring dashboard</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FeatureTracker>
          </TabsContent>

          {/* ASSETS TAB (reuse existing AssetManagement) */}
          <TabsContent value="assets">
            <FeatureTracker featureName="admin_assets_tab">
              <AssetManagement />
            </FeatureTracker>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureTracker>
  );
};

export default AdminDashboard;
