import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TradingChart from '@/components/trading/TradingChart';
import IronCondorBuilder from '@/components/trading/IronCondorBuilder';
import StrategyMarketplace from '@/components/strategies/StrategyMarketplace';
import BrokerConnections from '@/components/brokers/BrokerConnections';
import UpgradeToPremium from '@/components/subscription/UpgradeToPremium';
import InviteFriend from '@/components/community/InviteFriend';
import { FeatureTracker } from '@/components/analytics/FeatureTracker';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Plus, 
  UserPlus, 
  Gift, 
  Mail, 
  CreditCard, 
  Link as LinkIcon,
  Wallet
} from 'lucide-react';
import IGBrokerConnect from '@/components/brokers/IGBrokerConnect';

interface KemCredits {
  credits_earned: number;
  credits_spent: number;
  total_airdrops_received: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackFeatureUsage, trackActivity } = useAnalyticsContext();
  const [showIGConnect, setShowIGConnect] = useState(false);
  const [kemCredits, setKemCredits] = useState<KemCredits | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  // Mock subscription tier - in real app this would come from profiles table
  const isPremiumUser = false; // This would be fetched from user profile

  // KEM Credits calculation
  useEffect(() => {
    if (kemCredits) {
      setProgressValue(kemCredits.credits_earned % 100);
    }
  }, [kemCredits]);

  const fetchUserKemCredits = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('kem_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setKemCredits({
          credits_earned: data.credits_earned || 0,
          credits_spent: data.credits_spent || 0,
          total_airdrops_received: data.total_airdrops_received || 0
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching KEM credits",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserKemCredits();
  }, [fetchUserKemCredits]);

  const nextMilestone = kemCredits ? Math.ceil(kemCredits.credits_earned / 100) * 100 : 100;

  const handleIGSignup = () => {
    trackFeatureUsage('ig_broker_signup');
    trackActivity('external_link_click', { target: 'ig_broker' });
    window.open('https://refer.ig.com/royanuriens-3', '_blank');
  };

  const tradViewSignup = () => {
    trackFeatureUsage('tradingview_signup');
    trackActivity('external_link_click', { target: 'tradingview' });
    window.open('https://www.tradingview.com/?aff_id=154029', '_blank');
  };

  const handleConnectBroker = () => {
    trackFeatureUsage('broker_connect_modal');
    setShowIGConnect(true);
  };

  const handleIGConnectSuccess = () => {
    trackActivity('broker_connected', { broker: 'ig', credits_awarded: 10 });
    console.log('IG Broker connected successfully');
    // Refresh KEM credits after connection
    fetchUserKemCredits();
  };

  const handleCloseIGConnect = () => {
    setShowIGConnect(false);
  };

  const handleTabChange = (tabValue: string) => {
    trackFeatureUsage(`dashboard_tab_${tabValue}`);
  };

  return (
    <FeatureTracker featureName="user_dashboard" trackOnUnmount>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Manage your iron condor strategies and connect with the trading community</p>
        </div>

        {/* KEM Credits Overview Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-green-600" />
              <span>KEM Credits Overview</span>
            </CardTitle>
            <CardDescription>Track your KEM credits and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="text-lg font-semibold text-green-700">
                  {kemCredits?.credits_earned || 0}
                </div>
                <div className="text-sm text-gray-600">Credits Earned</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                <div className="text-lg font-semibold text-red-700">
                  {kemCredits?.credits_spent || 0}
                </div>
                <div className="text-sm text-gray-600">Credits Spent</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="text-lg font-semibold text-blue-700">
                  {kemCredits?.total_airdrops_received || 0} KEM
                </div>
                <div className="text-sm text-gray-600">Airdrops Received</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm font-medium mb-2">
                Next Milestone: {nextMilestone} Credits
              </div>
              <Progress value={progressValue} max={100} className="mb-2" />
              <p className="text-xs text-gray-500">
                {progressValue} / 100 Credits until next milestone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Create Strategy
              </CardTitle>
              <CardDescription>Build and publish new trading strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/create-strategy">
                <Button 
                  className="w-full bg-blue-600 border-red-800 text-white hover:bg-red-600 transition-colors mt-5"
                  onClick={() => {
                    trackFeatureUsage('create_strategy_click');
                    trackActivity('navigation', { target: 'create_strategy' });
                  }}
                >
                  Get Started
                </Button>
              </Link>
              <Button
                onClick={tradViewSignup}
                className="w-full bg-red-600 border-red-800 text-white hover:bg-blue-600 transition-colors mt-5"
                type="button"
              > 
                <span className="mr-2 inline-flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span> 
                Join TradingView            
              </Button>           
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-600" />
                KEM Airdrop
              </CardTitle>
              <CardDescription>Claim your KEM tokens from earned credits</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/airdrop">
                <Button 
                  variant="outline" 
                  className="w-full border-purple-200"
                  onClick={() => {
                    trackFeatureUsage('airdrop_click');
                    trackActivity('navigation', { target: 'airdrop' });
                  }}
                >
                  Claim Tokens
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Premium Plans
              </CardTitle>
              <CardDescription>Upgrade to unlock advanced features</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/product-offers">
                <Button 
                  variant="outline" 
                  className="w-full border-green-200"
                  onClick={() => {
                    trackFeatureUsage('premium_plans_click');
                    trackActivity('navigation', { target: 'premium_plans' });
                  }}
                >
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* IG Brokers Connect Card */}
          <Card className="hover:shadow-md transition-shadow border-red-400 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <span className="mr-2 inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600">
                    <path d="M12 17.3L18.2 21l-1.7-7.2L22 9.3l-7.3-.6L12 2 9.3 8.7 2 9.3l5.5 4.5L5.8 21z" fill="currentColor"/>
                  </svg>
                </span>
                Connect to IG Broker
              </CardTitle>
              <CardDescription>
                Professional options trading platform—unbeatable for iron condors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleConnectBroker}
                className="w-full bg-blue-700 text-white hover:bg-red-600 transition-colors font-medium"
                type="button"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect Broker Account
              </Button>
              <Button
                onClick={handleIGSignup}
                className="w-full bg-red-600 border-red-800 text-white hover:bg-blue-600 transition-colors"
                type="button"
              >
                <span className="mr-2 inline-flex">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Open IG Account
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade to Premium Card - Only for non-premium users */}
          {!isPremiumUser && (
            <Card className="hover:shadow-md transition-shadow border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Go Premium
                </CardTitle>
                <CardDescription>Unlock advanced features and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <UpgradeToPremium />
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Community
              </CardTitle>
              <CardDescription>Connect with fellow traders</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/community">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    trackFeatureUsage('community_click');
                    trackActivity('navigation', { target: 'community' });
                  }}
                >
                  Join Discussion
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Start Trading
              </CardTitle>
              <CardDescription>Begin your trading journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/trade-positions">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    trackFeatureUsage('start_trading_click');
                    trackActivity('navigation', { target: 'trade_positions' });
                  }}
                >
                  Start Trading
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Strategy Creator Notifications */}
          {isPremiumUser && (
            <Card className="hover:shadow-md transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Notifications
                </CardTitle>
                <CardDescription>Send targeted messages to traders</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/notifications">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-200"
                    onClick={() => {
                      trackFeatureUsage('notifications_click');
                      trackActivity('navigation', { target: 'notifications' });
                    }}
                  >
                    Manage Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="trading" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <FeatureTracker featureName="trading_tab">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FeatureTracker featureName="trading_chart">
                    <TradingChart symbol="SPY" />
                  </FeatureTracker>
                </div>
                <div>
                  <FeatureTracker featureName="iron_condor_builder">
                    <IronCondorBuilder />
                  </FeatureTracker>
                </div>
              </div>
            </FeatureTracker>
          </TabsContent>

          <TabsContent value="strategies">
            <FeatureTracker featureName="strategies_tab">
              <StrategyMarketplace />
            </FeatureTracker>
          </TabsContent>

          <TabsContent value="portfolio">
            <FeatureTracker featureName="portfolio_tab">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Management</CardTitle>
                  <CardDescription>Track your trading performance and positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-500">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Portfolio tracking coming soon</p>
                    <p>We're building advanced portfolio management tools for you.</p>
                  </div>
                </CardContent>
              </Card>
            </FeatureTracker>
          </TabsContent>

          <TabsContent value="brokers">
            <FeatureTracker featureName="brokers_tab">
              <BrokerConnections />
            </FeatureTracker>
          </TabsContent>

          <TabsContent value="invite">
            <FeatureTracker featureName="invite_tab">
              <div className="flex justify-center">
                <InviteFriend />
              </div>
            </FeatureTracker>
          </TabsContent>
        </Tabs>

        {/* IG Broker Connect Modal */}
        {showIGConnect && (
          <IGBrokerConnect
            onClose={handleCloseIGConnect}
            onConnect={handleIGConnectSuccess}
          />
        )}
      </div>
    </FeatureTracker>
  );
};

export default UserDashboard;
