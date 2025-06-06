
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Target, Users, Shield, BarChart3, Zap, Star, DollarSign, ChevronRight, Plus, ArrowRight, CheckCircle } from "lucide-react";
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
        .order('created_at', { ascending: false })
        .limit(6);

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

  const features = [
    {
      icon: Target,
      title: "Iron Condor Builder",
      description: "Visual strategy builder with real-time P&L analysis and risk management",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Copy Trading",
      description: "Follow and copy successful traders' strategies with customizable fee structures",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Broker Integration",
      description: "Connect to top international brokers: IG, TradeStation, Tradier, easyMarkets",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive performance tracking and market analysis tools",
      color: "text-orange-600"
    },
    {
      icon: Zap,
      title: "Automated Trading",
      description: "Python-powered trading bots for strategy automation and execution",
      color: "text-yellow-600"
    },
    {
      icon: TrendingUp,
      title: "TradingView Charts",
      description: "Professional charting with technical analysis and market data",
      color: "text-red-600"
    }
  ];

  const benefits = [
    "Professional-grade iron condor strategies",
    "Copy successful traders automatically",
    "Connect to major international brokers",
    "Real-time performance analytics",
    "Automated trading capabilities",
    "24/7 market monitoring"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Traderama
              </h1>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-4xl mx-auto leading-tight">
              Master Iron Condor Trading with
              <span className="text-blue-400"> Professional Tools</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Copy successful traders, automate your strategies, and connect to top brokers. 
              Join thousands of traders maximizing their options trading potential.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                  Start Trading Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              {user && (
                <Link to="/create-strategy">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Strategy
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-300 text-sm">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Iron Condor Success
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional tools and strategies designed for options trading excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gray-100 group-hover:bg-opacity-80 transition-colors w-fit`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Templates Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Community Iron Condor Strategies
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl">
                Discover and copy strategies created by our expert trader community
              </p>
            </div>
            {user && (
              <Link to="/create-strategy">
                <Button className="w-full lg:w-auto bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center p-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading strategies...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-lg leading-tight">{strategy.title}</CardTitle>
                        {strategy.is_premium_only && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gray-100">
                            {strategy.profiles?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {strategy.profiles?.name || 'Anonymous'}
                        </span>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {strategy.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold">{strategy.fee_percentage}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className={`h-4 w-4 ${getRiskColor(strategy.strategy_config)}`} />
                          <span className="font-semibold text-xs">{getRiskLevel(strategy.strategy_config)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-xs">
                            {strategy.strategy_config?.profitTarget || 25}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span className="font-semibold text-xs">
                            {strategy.strategy_config?.underlying || 'SPY'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                          {strategy.strategy_config?.timeframe || 'Weekly'} Strategy
                        </Badge>
                      </div>

                      <Button 
                        className="w-full group-hover:bg-blue-700 transition-colors"
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
                <div className="text-center p-12 bg-gray-50 rounded-2xl">
                  <div className="max-w-md mx-auto">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-semibold mb-2 text-gray-700">No strategies available yet</h4>
                    <p className="mb-6 text-gray-600">Be the first to create and publish an iron condor strategy!</p>
                    {user && (
                      <Link to="/create-strategy">
                        <Button className="bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600">
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
                    <Button size="lg" className="px-8 bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your Strategy
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="px-8">
                      Sign In to Create Strategies
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Start Trading Iron Condors?
          </h3>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of traders who trust Traderama for their options trading success
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100">
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
