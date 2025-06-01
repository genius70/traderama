
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Users, Shield, BarChart3, Zap, Star, DollarSign, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const strategyTemplates = [
  {
    id: 1,
    title: "SPY Weekly Iron Condor",
    description: "Conservative weekly strategy targeting 1-2% profit with 15-20 delta strikes",
    winRate: "78.5%",
    avgProfit: "1.2%",
    riskLevel: "Low",
    timeframe: "Weekly",
    premium: false,
    fee: "8.5%"
  },
  {
    id: 2,
    title: "QQQ High IV Iron Condor",
    description: "Premium strategy for high implied volatility periods with dynamic strike selection",
    winRate: "82.1%",
    avgProfit: "2.1%",
    riskLevel: "Medium",
    timeframe: "Monthly",
    premium: true,
    fee: "12.0%"
  },
  {
    id: 3,
    title: "IWM Small Cap Iron Condor",
    description: "Aggressive strategy targeting higher returns with managed risk on small caps",
    winRate: "71.2%",
    avgProfit: "2.8%",
    riskLevel: "High",
    timeframe: "Bi-weekly",
    premium: true,
    fee: "15.0%"
  }
];

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

      {/* Strategy Templates Section */}
      <div className="container mx-auto px-6 py-16 bg-white">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Proven Iron Condor Strategies
          </h3>
          <p className="text-lg text-gray-600">
            Choose from our curated collection of high-performance trading strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {strategyTemplates.map((strategy) => (
            <Card key={strategy.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{strategy.title}</CardTitle>
                  {strategy.premium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{strategy.winRate}</span>
                    <span className="text-gray-500">Win Rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{strategy.avgProfit}</span>
                    <span className="text-gray-500">Avg Profit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className={`h-4 w-4 ${
                      strategy.riskLevel === 'Low' ? 'text-green-500' :
                      strategy.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <span className="font-semibold">{strategy.riskLevel}</span>
                    <span className="text-gray-500">Risk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{strategy.fee}</span>
                    <span className="text-gray-500">Fee</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Badge variant="outline" className="text-xs">
                    {strategy.timeframe}
                  </Badge>
                </div>

                <Link to="/auth">
                  <Button className="w-full group">
                    Get Started with This Strategy
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button variant="outline" size="lg">
              View All Strategies
            </Button>
          </Link>
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
