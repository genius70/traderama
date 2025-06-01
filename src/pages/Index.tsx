
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Users, Shield, BarChart3, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>
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
