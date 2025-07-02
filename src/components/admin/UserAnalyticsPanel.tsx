
import { useEffect, useState } from "react";
import { Users, Activity, Eye, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalPageViews: number;
  avgSessionDuration: number;
  totalEngagements: number;
  errorRate: number;
  topFeatures: Array<{ feature_name: string; usage_count: number; success_rate: number }>;
}

export default function UserAnalyticsPanel() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalPageViews: 0,
    avgSessionDuration: 0,
    totalEngagements: 0,
    errorRate: 0,
    topFeatures: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get active users (users with activity in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await supabase
          .from('user_sessions')
          .select('user_id', { count: 'exact', head: true })
          .gte('started_at', thirtyDaysAgo.toISOString());

        // Get new signups (last 30 days)
        const { count: newSignups } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Get total page views
        const { count: totalPageViews } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true });

        // Get average session duration
        const { data: avgSessionData } = await supabase
          .from('user_sessions')
          .select('duration_seconds')
          .not('duration_seconds', 'is', null);

        const avgSessionDuration = avgSessionData?.length 
          ? Math.round(avgSessionData.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / avgSessionData.length)
          : 0;

        // Get total engagements
        const { count: totalEngagements } = await supabase
          .from('user_engagement')
          .select('*', { count: 'exact', head: true });

        // Get error rate
        const { count: totalErrors } = await supabase
          .from('error_logs')
          .select('*', { count: 'exact', head: true });

        const errorRate = totalPageViews ? ((totalErrors || 0) / totalPageViews * 100) : 0;

        // Get top features
        const { data: topFeatures } = await supabase
          .from('feature_usage')
          .select('feature_name, usage_count, success_rate')
          .order('usage_count', { ascending: false })
          .limit(5);

        setAnalytics({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newSignups: newSignups || 0,
          totalPageViews: totalPageViews || 0,
          avgSessionDuration,
          totalEngagements: totalEngagements || 0,
          errorRate: Math.round(errorRate * 100) / 100,
          topFeatures: topFeatures || []
        });

      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">User Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-medium">User Analytics Overview</CardTitle>
            <CardDescription>Comprehensive user behavior and engagement metrics</CardDescription>
          </div>
          <Users className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics.activeUsers}</div>
              <div className="text-sm text-gray-500">Active Users (30d)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">+{analytics.newSignups}</div>
              <div className="text-sm text-gray-500">New Signups (30d)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{analytics.totalPageViews}</div>
              <div className="text-sm text-gray-500">Page Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(analytics.avgSessionDuration / 60)}m {analytics.avgSessionDuration % 60}s</div>
            <p className="text-xs text-muted-foreground">Average session duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.totalEngagements}</div>
            <p className="text-xs text-muted-foreground">Total user interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Errors per page view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {analytics.totalPageViews ? Math.round((analytics.totalEngagements / analytics.totalPageViews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Interactions per page view</p>
          </CardContent>
        </Card>
      </div>

      {analytics.topFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Top Features</CardTitle>
            <CardDescription>Most used features and their success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topFeatures.map((feature, index) => (
                <div key={feature.feature_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{feature.feature_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm text-gray-500">{feature.usage_count} uses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{Math.round(feature.success_rate)}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
