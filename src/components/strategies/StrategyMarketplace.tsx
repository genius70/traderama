
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth";

interface PerformanceMetrics {
  total_return?: number;
  annual_return?: number;
  max_drawdown?: number;
  sharpe_ratio?: number;
  win_rate?: number;
  [key: string]: unknown;
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  fee_percentage: number;
  performance_metrics: PerformanceMetrics | null;
  creator_id: string;
  is_premium_only: boolean;
}

const StrategyMarketplace = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchStrategies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        fee_percentage: item.fee_percentage || 0,
        performance_metrics: item.performance_metrics as PerformanceMetrics | null,
        creator_id: item.creator_id,
        is_premium_only: item.is_premium_only || false
      }));
      
      setStrategies(transformedData);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: "Error loading strategies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const subscribeToStrategy = async (strategyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('strategy_subscriptions')
        .insert({
          strategy_id: strategyId,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Strategy subscribed!",
      });
    } catch (error) {
      console.error('Error subscribing to strategy:', error);
      toast({
        title: "Subscription failed",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading strategies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Strategy Marketplace</h2>
        <Button>Create Strategy</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{strategy.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Creator</span>
                  </div>
                </div>
                {strategy.is_premium_only && (
                  <Badge variant="secondary">Premium</Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {strategy.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Fee: {strategy.fee_percentage}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Performance</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>0 Followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span>5.0 Rating</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => subscribeToStrategy(strategy.id)}
              >
                Subscribe & Copy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {strategies.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No published strategies available yet. Be the first to create one!
        </div>
      )}
    </div>
  );
};

export default StrategyMarketplace;
