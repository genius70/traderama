
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Target, Users, Shield, BarChart3, Zap, Star, DollarSign, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Strategy {
  id: string;
  title: string;
  description: string;
  fee_percentage: number;
  strategy_config: any;
  performance_metrics: any;
  creator_id: string;
  is_premium_only: boolean;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

const Index = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: "Error loading strategies",
        description: "Failed to load trading strategies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToStrategy = async (strategyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to strategies",
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
        description: "You can now copy trades from this strategy",
      });
    } catch (error) {
      console.error('Error subscribing to strategy:', error);
      toast({
        title: "Subscription failed",
        description: "Failed to subscribe to strategy",
        variant: "destructive",
      });
    }
  };

  const getRiskColor = (config: any) => {
    if (!config) return 'text-gray-500';
    const stopLoss = config.stopLoss || 200;
    if (stopLoss <= 150) return 'text-green-500';
    if (stopLoss <= 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskLevel = (config: any) => {
    if (!config) return 'Medium';
    const stopLoss = config.stopLoss || 200;
    if (stopLoss <= 150) return 'Low';
    if (stopLoss <= 200) return 'Medium';
    return 'High';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center space-x-3">
            <TrendingUp className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Traderama
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 max-w-4xl mx-auto">
            Professional Iron Condor Trading Platform
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master iron condor strategies with our professional-grade platform. 
            Copy successful traders, automate your strategies, and connect to top brokers.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Trading Now
              </Button>
            </Link>
            {user && (
              <Link to="/create-strategy">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Strategy
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Strategy Templates Section */}
      <div className="container mx-auto px-6 py-16 bg-white">
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Community Iron Condor Strategies
            </h3>
            <p className="text-lg text-gray-600">
              Discover and copy strategies created by our expert trader community
            </p>
          </div>
          {user && (
            <Link to="/create-strategy">
              <Button className="ml-8">
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading strategies...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {strategies.map((strategy) => (
                <Card key={strategy.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                      {strategy.is_premium_only && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {strategy.profiles?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {strategy.profiles?.name || 'Anonymous'}
                      </span>
                    </div>
                    <CardDescription className="text-sm">
                      {strategy.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{strategy.fee_percentage}%</span>
                        <span className="text-gray-500">Fee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className={`h-4 w-4 ${getRiskColor(strategy.strategy_config)}`} />
                        <span className="font-semibold">{getRiskLevel(strategy.strategy_config)}</span>
                        <span className="text-gray-500">Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                          {strategy.strategy_config?.profitTarget || 25}%
                        </span>
                        <span className="text-gray-500">Target</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">
                          {strategy.strategy_config?.underlying || 'SPY'}
                        </span>
                        <span className="text-gray-500">Asset</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        {strategy.strategy_config?.timeframe || 'Weekly'} Strategy
                      </Badge>
                    </div>

                    <Button 
                      className="w-full group"
                      onClick={() => subscribeToStrategy(strategy.id)}
                    >
                      Subscribe & Copy
                      <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {strategies.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <div className="max-w-md mx-auto">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold mb-2">No strategies available yet</h4>
                  <p className="mb-4">Be the first to create and publish an iron condor strategy!</p>
                  {user && (
                    <Link to="/create-strategy">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Strategy
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              {user ? (
                <Link to="/create-strategy">
                  <Button variant="outline" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your Strategy
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="lg">
                    Sign In to Create Strategies
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Iron Condor Trading
          </h3>
          <p className="text-lg text-gray-600">
            Professional tools and strategies for options trading success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>Iron Condor Builder</CardTitle>
              <CardDescription>
                Visual strategy builder with real-time P&L analysis and risk management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Copy Trading</CardTitle>
              <CardDescription>
                Follow and copy successful traders' strategies with customizable fee structures
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Broker Integration</CardTitle>
              <CardDescription>
                Connect to top international brokers: IG, TradeStation, Tradier, easyMarkets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-orange-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Comprehensive performance tracking and market analysis tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-4" />
              <CardTitle>Automated Trading</CardTitle>
              <CardDescription>
                Python-powered trading bots for strategy automation and execution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>TradingView Charts</CardTitle>
              <CardDescription>
                Professional charting with technical analysis and market data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Trading Iron Condors?
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust Traderama for their options trading success
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
