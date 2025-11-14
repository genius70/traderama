import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

interface FeatureUsageData {
  feature_name: string;
  usage_count: number;
  success_rate: number;
}

interface PageViewData {
  page_path: string;
  views: number;
  unique_users: number;
}

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  totalTrades: number;
  copiedStrategies: number;
  platformRevenue: number;
  activeSubscriptions: number;
}

interface DailyAnalyticsData {
  date: string;
  activeUsers: number;
  tradesPlaced: number;
  subscriptionSignups: number;
  revenue: number;
}

const UserAnalyticsPanel: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    totalTrades: 0,
    copiedStrategies: 0,
    platformRevenue: 0,
    activeSubscriptions: 0,
  });
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData[]>([]);
  const [topPages, setTopPages] = useState<PageViewData[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch total users and new signups
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, created_at');
        if (profilesError) throw profilesError;

        const totalUsers = profilesData.length;
        const newSignups = profilesData.filter(
          (profile) => new Date(profile.created_at) >= thirtyDaysAgo
        ).length;

        // Fetch page views for session data
        const { data: pageViewsData, error: pageViewsError } = await supabase
          .from('page_views')
          .select('user_id, created_at, duration_seconds')
          .gte('created_at', thirtyDaysAgo.toISOString());
        if (pageViewsError) throw pageViewsError;

        const activeUsers = new Set(pageViewsData.map((view) => view.user_id)).size;
        const totalSessions = pageViewsData.length;
        const avgSessionDuration =
          pageViewsData.reduce((sum, view) => sum + (view.duration_seconds || 0), 0) /
          (totalSessions || 1);
        
        // Calculate bounce rate from sessions with duration < 10 seconds or single page views
        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('duration_seconds')
          .gte('started_at', thirtyDaysAgo.toISOString());
        
        const bouncedSessions = sessionsData?.filter(
          session => (session.duration_seconds || 0) < 10
        ).length || 0;
        const bounceRate = sessionsData?.length ? (bouncedSessions / sessionsData.length) * 100 : 0;

        // Fetch trading data
        const { data: tradesData, error: tradesError } = await supabase
          .from('iron_condor_trades')
          .select('id, opened_at');
        if (tradesError) throw tradesError;

        const totalTrades = tradesData.length;

        // Fetch strategy subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('strategy_subscriptions')
          .select('id, purchased_at, fees_paid');
        if (subscriptionsError) throw subscriptionsError;

        const copiedStrategies = subscriptionsData.length;

        // Calculate platform revenue from strategy subscriptions
        const platformRevenue = subscriptionsData.reduce(
          (sum, subscription) => sum + (subscription.fees_paid || 0),
          0
        );

        const activeSubscriptions = subscriptionsData.length;

        // Fetch feature usage data
        const { data: featureData, error: featureError } = await supabase
          .from('feature_usage')
          .select('feature_name, usage_count, success_rate')
          .order('usage_count', { ascending: false })
          .limit(10);
        if (featureError) throw featureError;

        const validFeatureData: FeatureUsageData[] = featureData
          .filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              'feature_name' in item &&
              'usage_count' in item &&
              'success_rate' in item
          )
          .map((item) => ({
            feature_name: String(item.feature_name),
            usage_count: Number(item.usage_count) || 0,
            success_rate: Number(item.success_rate) || 0,
          }));
        setFeatureUsage(validFeatureData);

        // Fetch page views data
        const { data: pageData, error: pageError } = await supabase
          .from('page_views')
          .select('page_path, user_id, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());
        if (pageError) throw pageError;

        const pageViewCounts: Record<string, { views: number; users: Set<string> }> = {};
        pageData.forEach((view) => {
          if (view && typeof view === 'object' && 'page_path' in view && 'user_id' in view) {
            const pagePath = String(view.page_path);
            if (!pageViewCounts[pagePath]) {
              pageViewCounts[pagePath] = { views: 0, users: new Set() };
            }
            pageViewCounts[pagePath].views++;
            pageViewCounts[pagePath].users.add(String(view.user_id));
          }
        });

        const topPagesData: PageViewData[] = Object.entries(pageViewCounts)
          .map(([path, data]) => ({
            page_path: path,
            views: data.views,
            unique_users: data.users.size,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);
        setTopPages(topPagesData);

        // Aggregate daily analytics for charts
        const dataByDate: { [key: string]: DailyAnalyticsData } = {};
        for (let i = 0; i < 30; i++) {
          const date = new Date(thirtyDaysAgo);
          date.setDate(thirtyDaysAgo.getDate() + i);
          const dateString = date.toISOString().split('T')[0];
          dataByDate[dateString] = {
            date: dateString,
            activeUsers: 0,
            tradesPlaced: 0,
            subscriptionSignups: 0,
            revenue: 0,
          };
        }

        // Aggregate active users from page views
        pageViewsData.forEach((view) => {
          if (view.created_at) {
            const date = new Date(view.created_at).toISOString().split('T')[0];
            if (dataByDate[date]) {
              dataByDate[date].activeUsers = new Set(
                pageViewsData
                  .filter((v) => v.created_at && new Date(v.created_at).toISOString().split('T')[0] === date)
                  .map((v) => v.user_id)
              ).size;
            }
          }
        });

        // Aggregate trades
        tradesData.forEach((trade) => {
          if (trade.opened_at) {
            const date = new Date(trade.opened_at).toISOString().split('T')[0];
            if (dataByDate[date]) {
              dataByDate[date].tradesPlaced += 1;
            }
          }
        });

        // Aggregate strategy subscriptions
        subscriptionsData.forEach((sub) => {
          if (sub.purchased_at) {
            const date = new Date(sub.purchased_at).toISOString().split('T')[0];
            if (dataByDate[date]) {
              dataByDate[date].subscriptionSignups += 1;
            }
          }
        });

        // Aggregate revenue from strategy subscriptions
        subscriptionsData.forEach((subscription) => {
          if (subscription.purchased_at) {
            const date = new Date(subscription.purchased_at).toISOString().split('T')[0];
            if (dataByDate[date]) {
              dataByDate[date].revenue += subscription.fees_paid || 0;
            }
          }
        });

        const dailyAnalyticsData = Object.values(dataByDate);
        setDailyAnalytics(dailyAnalyticsData);

        // Update metrics
        setMetrics({
          totalUsers,
          activeUsers,
          newSignups,
          totalSessions,
          avgSessionDuration,
          bounceRate,
          totalTrades,
          copiedStrategies,
          platformRevenue,
          activeSubscriptions,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({ title: 'Error fetching analytics', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics Overview</CardTitle>
          <CardDescription>Key metrics and user engagement data</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading analytics...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-500">Active Users (30d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.newSignups}</div>
                <div className="text-sm text-gray-500">New Signups (30d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.totalTrades}</div>
                <div className="text-sm text-gray-500">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.copiedStrategies}</div>
                <div className="text-sm text-gray-500">Copied Strategies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${metrics.platformRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Platform Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.activeSubscriptions}</div>
                <div className="text-sm text-gray-500">Active Subscriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.totalSessions}</div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most used features and their success rates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading feature usage...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage_count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Analytics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
          <CardDescription>User activity and trading trends</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading daily analytics...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                  <Line type="monotone" dataKey="tradesPlaced" stroke="#82ca9d" name="Trades Placed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription & Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Revenue Trends</CardTitle>
          <CardDescription>Subscription signups and platform revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading trends...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subscriptionSignups" fill="#8884d8" name="Subscription Signups" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages by view count</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading top pages...</div>
          ) : (
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={page.page_path} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{page.page_path}</div>
                      <div className="text-sm text-gray-500">{page.views} views</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{page.unique_users}</div>
                    <div className="text-sm text-gray-500">unique users</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>User engagement and retention indicators</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">Loading engagement metrics...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Session Duration</span>
                  <span>{Math.round(metrics.avgSessionDuration / 60)} min</span>
                </div>
                <Progress value={Math.min(metrics.avgSessionDuration / 10, 100)} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Bounce Rate</span>
                  <span>{metrics.bounceRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.bounceRate} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalyticsPanel;
