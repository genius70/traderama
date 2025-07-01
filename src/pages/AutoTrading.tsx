
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, TrendingUp, Users, Settings, Play, Pause, AlertCircle } from 'lucide-react';
import CopyTradingComponent from '@/components/trading/CopyTradingComponent';

const AutoTrading = () => {
  const { user, loading } = useAuth();
  const [activeStrategies, setActiveStrategies] = useState([]);
  const [isAutoTradingEnabled, setIsAutoTradingEnabled] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Bot className="h-8 w-8 mr-3 text-blue-600" />
            Auto Trading
          </h1>
          <p className="text-gray-600">Automated trading strategies and copy trading features</p>
        </div>

        {/* Auto Trading Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Auto Trading Status</CardTitle>
                <CardDescription>Monitor and control your automated trading</CardDescription>
              </div>
              <Badge variant={isAutoTradingEnabled ? "default" : "secondary"}>
                {isAutoTradingEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isAutoTradingEnabled ? (
                  <Play className="h-8 w-8 text-green-600" />
                ) : (
                  <Pause className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">
                    {isAutoTradingEnabled ? "Auto trading is running" : "Auto trading is paused"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activeStrategies.length} strategies active
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsAutoTradingEnabled(!isAutoTradingEnabled)}
                variant={isAutoTradingEnabled ? "destructive" : "default"}
              >
                {isAutoTradingEnabled ? "Pause Trading" : "Start Trading"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strategies">My Strategies</TabsTrigger>
            <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="strategies">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Iron Condor Strategy
                  </CardTitle>
                  <CardDescription>Automated iron condor trades on SPY</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">P&L This Month</span>
                      <span className="font-medium text-green-600">+$1,250</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Trade</span>
                      <span className="text-sm">In 2 hours</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                    Credit Spread Strategy
                  </CardTitle>
                  <CardDescription>Weekly credit spreads on QQQ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="secondary">Paused</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">P&L This Month</span>
                      <span className="font-medium text-red-600">-$320</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Trade</span>
                      <span className="text-sm">Yesterday</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Resume Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="copy-trading">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CopyTradingComponent />
              
              <Card>
                <CardHeader>
                  <CardTitle>My Copy Trades</CardTitle>
                  <CardDescription>Strategies you're currently copying</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No Active Copy Trades</p>
                    <p>Start copying successful traders to diversify your portfolio.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Risk Management
                  </CardTitle>
                  <CardDescription>Configure your risk parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Max Position Size</span>
                      <span className="font-medium">$5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Loss Limit</span>
                      <span className="font-medium">$500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Max Open Positions</span>
                      <span className="font-medium">10</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Modify Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Broker Connection</CardTitle>
                  <CardDescription>Manage your broker integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">IG Broker</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Account Balance</span>
                      <span className="font-medium">$25,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm">2 minutes ago</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Manage Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AutoTrading;
