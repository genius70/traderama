
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Define proper types for analytics data
interface FeatureUsageData {
  feature_name: string;
  usage_count: number;
  success_rate: number;
}

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface PageViewData {
  page_path: string;
  views: number;
  unique_users: number;
}

const UserAnalyticsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
  });
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData[]>([]);
  const [topPages, setTopPages] = useState<PageViewData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch feature usage data
      const { data: featureData } = await supabase
        .from("feature_usage")
        .select("feature_name, usage_count, success_rate")
        .order("usage_count", { ascending: false })
        .limit(10);

      if (featureData) {
        // Transform and validate the data
        const validFeatureData: FeatureUsageData[] = featureData
          .filter(item => 
            item && 
            typeof item === 'object' && 
            'feature_name' in item &&
            'usage_count' in item &&
            'success_rate' in item
          )
          .map(item => ({
            feature_name: String(item.feature_name),
            usage_count: Number(item.usage_count) || 0,
            success_rate: Number(item.success_rate) || 0,
          }));
        
        setFeatureUsage(validFeatureData);
      }

      // Fetch page views data
      const { data: pageData } = await supabase
        .from("page_views")
        .select("page_path")
        .order("created_at", { ascending: false });

      if (pageData) {
        // Process page views to get top pages
        const pageViewCounts: Record<string, { views: number; users: Set<string> }> = {};
        
        pageData.forEach(view => {
          if (view && typeof view === 'object' && 'page_path' in view) {
            const pagePath = String(view.page_path);
            if (!pageViewCounts[pagePath]) {
              pageViewCounts[pagePath] = { views: 0, users: new Set() };
            }
            pageViewCounts[pagePath].views++;
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
      }

      // Fetch user metrics
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: false });

      if (profilesData) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const newSignupsCount = profilesData.filter(profile => {
          if (profile && typeof profile === 'object' && 'created_at' in profile) {
            const createdAt = new Date(String(profile.created_at));
            return createdAt >= oneWeekAgo;
          }
          return false;
        }).length;

        setMetrics(prev => ({
          ...prev,
          totalUsers: profilesData.length,
          newSignups: newSignupsCount,
        }));
      }

    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics Overview</CardTitle>
          <CardDescription>Key metrics and user engagement data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.newSignups}</div>
              <div className="text-sm text-gray-500">New Signups (7d)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.totalSessions}</div>
              <div className="text-sm text-gray-500">Total Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most used features and their success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="feature_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage_count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages by view count</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
          <CardDescription>User engagement and retention indicators</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalyticsPanel;
