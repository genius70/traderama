import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  PlusCircle,
  BarChart3,
  Target,
  Star,
} from "lucide-react";

interface CreatorMetrics {
  activeStrategies: number;
  totalPerformance: number;
  followers: number;
  revenue: number;
  bestPerformingStrategy: number;
  averageReturn: number;
  winRate: number;
  recentActivity: Array<{
    name: string;
    performance: number;
    timeframe: string;
    color: string;
  }>;
}

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<CreatorMetrics>({
    activeStrategies: 0,
    totalPerformance: 0,
    followers: 0,
    revenue: 0,
    bestPerformingStrategy: 0,
    averageReturn: 0,
    winRate: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorMetrics = async () => {
      if (!user) return;

      try {
        // Fetch creator's strategies
        const { data: strategies, error: strategiesError } = await supabase
          .from('trading_strategies')
          .select('id, title, performance_metrics')
          .eq('creator_id', user.id);

        if (strategiesError) throw strategiesError;

        // Fetch strategy subscriptions for revenue calculation
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('strategy_subscriptions')
          .select('fees_paid, strategy_id')
          .in('strategy_id', strategies?.map(s => s.id) || []);

        if (subscriptionsError) throw subscriptionsError;

        // Fetch profile data for followers
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('followers_count')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Calculate metrics
        const activeStrategies = strategies?.length || 0;
        const revenue = subscriptions?.reduce((sum, sub) => sum + (sub.fees_paid || 0), 0) || 0;
        const followers = profile?.followers_count || 0;

        // Parse performance metrics
        const performances = strategies?.map(s => {
          try {
            const metrics = typeof s.performance_metrics === 'string' 
              ? JSON.parse(s.performance_metrics) 
              : s.performance_metrics;
            return metrics?.total_return || 0;
          } catch {
            return 0;
          }
        }) || [];

        const totalPerformance = performances.length > 0 
          ? performances.reduce((sum, perf) => sum + perf, 0) / performances.length 
          : 0;
        const bestPerformingStrategy = Math.max(...performances, 0);
        const averageReturn = totalPerformance;
        const winRate = performances.filter(p => p > 0).length / Math.max(performances.length, 1) * 100;

        // Fetch recent activity from posts
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content, created_at')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false })
          .limit(3);
        
        const recentActivity = posts?.map((post, index) => {
          const createdAt = post.created_at ? new Date(post.created_at) : new Date();
          const daysAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return {
            name: post.content.substring(0, 30) + '...',
            performance: performances[index] || 0,
            timeframe: daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`,
            color: index === 0 ? 'green' : index === 1 ? 'blue' : 'orange',
          };
        }) || [];

        setMetrics({
          activeStrategies,
          totalPerformance,
          followers,
          revenue,
          bestPerformingStrategy,
          averageReturn,
          winRate,
          recentActivity,
        });
      } catch (error) {
        console.error('Error fetching creator metrics:', error);
        toast({
          title: "Error fetching dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorMetrics();
  }, [user, toast]);
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">Loading creator dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Premium Strategy Creator Dashboard
          </CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium">Active Strategies:</span>
              <span className="ml-auto text-sm text-green-500">{metrics.activeStrategies}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Total Performance:</span>
              <span className="ml-auto text-sm text-blue-500">
                {metrics.totalPerformance > 0 ? '+' : ''}{metrics.totalPerformance.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Followers:</span>
              <span className="ml-auto text-sm text-purple-500">{metrics.followers}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Revenue Generated:</span>
              <span className="ml-auto text-sm text-orange-500">${metrics.revenue.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Build and deploy new trading strategies with advanced tools and
              backtesting capabilities.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/create-strategy">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Strategy Templates
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Best Performing Strategy</span>
                <span className="text-green-500">
                  {metrics.bestPerformingStrategy > 0 ? '+' : ''}{metrics.bestPerformingStrategy.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Return</span>
                <span className="text-blue-500">
                  {metrics.averageReturn > 0 ? '+' : ''}{metrics.averageReturn.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Win Rate</span>
                <span className="text-purple-500">{metrics.winRate.toFixed(0)}%</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Strategy Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`} />
                    <span className="text-sm font-medium">
                      {activity.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm text-${activity.color}-500`}>
                      {activity.performance > 0 ? '+' : ''}{activity.performance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.timeframe}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-gray-500">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No recent activity</p>
                <p className="text-sm">Create your first strategy to see activity here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
