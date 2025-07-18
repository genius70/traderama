import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  Users,
  Shield,
  BarChart3,
  Zap,
  TrendingUp,
} from "lucide-react";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: "Iron Condor Builder",
      description:
        "Visual strategy builder with real-time P&L analysis and risk management",
      color: "text-blue-600",
    },
    {
      icon: Users,
      title: "Copy Trading",
      description:
        "Follow and copy successful traders' strategies with customizable fee structures",
      color: "text-green-600",
    },
    {
      icon: Shield,
      title: "Broker Integration",
      description:
        "Connect to top international brokers: IG, TradeStation, Tradier, easyMarkets",
      color: "text-purple-600",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive performance tracking and market analysis tools",
      color: "text-orange-600",
    },
    {
      icon: Zap,
      title: "Automated Trading",
      description:
        "Python-powered trading bots for strategy automation and execution",
      color: "text-yellow-600",
    },
    {
      icon: TrendingUp,
      title: "TradingView Charts",
      description:
        "Professional charting with technical analysis and market data",
      color: "text-red-600",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Options Traders' Success
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional tools and strategies designed for options trading
            excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="inline-flex p-3 rounded-xl bg-gray-100 group-hover:bg-opacity-80 transition-colors w-fit">
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
