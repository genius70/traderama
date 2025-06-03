import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Target, DollarSign } from 'lucide-react';
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
import AssetManagement from '@/components/admin/AssetManagement';

const mockAnalytics = {
  totalUsers: 1250,
  newSignups: 45,
  totalStrategies: 320,
  newStrategies: 12,
  totalTrades: 8750,
  newTrades: 230,
  revenue: 15000,
};

const chartData = [
  { month: 'Jan', users: 120, trades: 200 },
  { month: 'Feb', users: 150, trades: 250 },
  { month: 'Mar', users: 180, trades: 300 },
  { month: 'Apr', users: 220, trades: 350 },
  { month: 'May', users: 260, trades: 400 },
  { month: 'Jun', users: 300, trades: 450 },
];

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Analytics</h1>
          <p className="text-gray-600">Platform insights and asset management</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{mockAnalytics.newSignups} new this month
                  </p>
                </CardContent>
              </Card>

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
                  <p className="text-xs text-muted-foreground">
                    Monthly recurring revenue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Volume</CardTitle>
                  <CardDescription>Monthly trading activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="trades" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">User management coming soon</p>
                  <p>Advanced user management features are being developed.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading">
            <Card>
              <CardHeader>
                <CardTitle>Trading Analytics</CardTitle>
                <CardDescription>Platform trading statistics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Trading analytics coming soon</p>
                  <p>Detailed trading performance metrics are being developed.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <AssetManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminAnalytics;
