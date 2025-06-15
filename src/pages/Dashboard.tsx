import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import TradingChart from '@/components/trading/TradingChart';
import IronCondorBuilder from '@/components/trading/IronCondorBuilder';
import StrategyMarketplace from '@/components/strategies/StrategyMarketplace';
import BrokerConnections from '@/components/brokers/BrokerConnections';
import UpgradeToPremium from '@/components/subscription/UpgradeToPremium';
import InviteFriend from '@/components/community/InviteFriend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Target, Plus, UserPlus, Gift, Mail, CreditCard, Link as LinkIcon } from 'lucide-react';
import IGBrokerConnect from '@/components/brokers/IGBrokerConnect';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [showIGConnect, setShowIGConnect] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isAdmin = user?.email === 'royan.shaw@gmail.com';
  // Mock subscription tier - in real app this would come from profiles table
  const isPremiumUser = false; // This would be fetched from user profile

  const handleIGSignup = () => {
    window.open('https://refer.ig.com/royanuriens-3', '_blank');
  };

  const handleConnectBroker = () => {
    setShowIGConnect(true);
  };

  const handleIGConnectSuccess = () => {
    // Refresh connection status or show success message
    console.log('IG Broker connected successfully');
  };

  const handleCloseIGConnect = () => {
    setShowIGConnect(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Manage your iron condor strategies and connect with the trading community</p>
        </div>

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
                <Button className="w-full">Get Started</Button>
              </Link>
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
                <Button variant="outline" className="w-full border-purple-200">Claim Tokens</Button>
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
                <Button variant="outline" className="w-full border-green-200">View Plans</Button>
              </Link>
            </CardContent>
          </Card>

          {/* IG Brokers Connect Card */}
          <Card className="hover:shadow-md transition-shadow border-red-400 bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <span className="mr-2 inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600"><path d="M12 17.3L18.2 21l-1.7-7.2L22 9.3l-7.3-.6L12 2 9.3 8.7 2 9.3l5.5 4.5L5.8 21z" fill="currentColor"/></svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                <Button variant="outline" className="w-full">Join Discussion</Button>
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
              <Link to="/dashboard?tab=trading">
                <Button className="w-full bg-green-600 hover:bg-green-700">
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
                  <Button variant="outline" className="w-full border-blue-200">Manage Notifications</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Analytics
                </CardTitle>
                <CardDescription>Platform insights and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button variant="outline" className="w-full">View Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradingChart symbol="SPY" />
              </div>
              <div>
                <IronCondorBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <StrategyMarketplace />
          </TabsContent>

          <TabsContent value="portfolio">
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
          </TabsContent>

          <TabsContent value="brokers">
            <BrokerConnections />
          </TabsContent>

          <TabsContent value="invite">
            <div className="flex justify-center">
              <InviteFriend />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* IG Broker Connect Modal */}
      {showIGConnect && (
        <IGBrokerConnect
          onClose={handleCloseIGConnect}
          onConnect={handleIGConnectSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
