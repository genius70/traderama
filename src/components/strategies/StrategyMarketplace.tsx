import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CopyTradingComponent from '@/components/trading/CopyTradingComponent';

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

const StrategyMarketplace: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedStrategies = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const transformedData = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        fee_percentage: item.fee_percentage || 0,
        performance_metrics: item.performance_metrics as PerformanceMetrics | null,
        creator_id: item.creator_id,
        is_premium_only: item.is_premium_only || false,
      }));
      
      setStrategies(transformedData);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({ title: 'Error fetching strategies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApprovedStrategies();
  }, [fetchApprovedStrategies]);

  const handleCopyStrategy = async (strategy: Strategy) => {
    if (!user) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    try {
      if (strategy.is_premium_only) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .single();
        if (!subscription || subscription.status !== 'active') {
          toast({ title: 'Premium subscription required', variant: 'destructive' });
          return;
        }
      }

      const { error } = await supabase.from('user_strategies').insert({
        user_id: user.id,
        strategy_id: strategy.id,
        status: 'active',
      });
      if (error) throw error;

      toast({ title: 'Strategy Copied', description: `${strategy.title} added to your strategies.` });
    } catch (error) {
      console.error('Error copying strategy:', error);
      toast({ title: 'Error copying strategy', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Strategy Marketplace</h1>
      {loading ? (
        <div className="text-center p-8">Loading strategies...</div>
      ) : strategies.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No approved strategies available yet. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {strategy.is_premium_only && <Badge variant="secondary">Premium</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Fee: {strategy.fee_percentage}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>
                      Return:{' '}
                      {strategy.performance_metrics?.total_return
                        ? `${strategy.performance_metrics.total_return.toFixed(2)}%`
                        : 'N/A'}
                    </span>
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
                  onClick={() => handleCopyStrategy(strategy)}
                >
                  Copy Strategy
                </Button>
                <CopyTradingComponent strategyId={strategy.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrategyMarketplace;
