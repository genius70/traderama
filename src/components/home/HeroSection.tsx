import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Plus, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  user: any;
  userRole: string | null;
  showBadge: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  userRole,
  showBadge,
}) => {
  const benefits = [
    "Professional-grade iron condor strategies",
    "Copy successful traders automatically",
    "Connect to major international brokers",
    "Real-time performance analytics",
    "Automated trading capabilities",
    "24/7 market monitoring",
  ];

  const getRedirectPath = () => {
    if (!user) return "/auth";
    switch (userRole) {
      case "super_admin":
        return "/admin";
      case "admin":
      case "strategy_creator":
      case "user":
      default:
        return "/dashboard";
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center space-y-8">
          {/* Logo + Title */}
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Traderama
            </h1>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-4xl mx-auto leading-tight">
            Master Iron Condor Among Other Options Trading Strategies with
            <span className="text-blue-400"> Professional Tools</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Copy successful traders, automate your strategies, and connect to
            top brokers. Join thousands of traders maximizing their options
            trading potential.
          </p>

          {/* Buttons & Badge - Responsive Layout */}
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto">
            {/* Mobile: Badge on top, then button */}
            {/* Desktop: Button left, badge right */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              {/* Start Trading Now Button */}
              <Link to={getRedirectPath()} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-blue-600 hover:bg-red-600 text-white transition-all duration-300 flex items-center justify-center"
                >
                  Start Trading Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              {/* NextBigProduct Badge - Only for logged-out users */}
              {showBadge &&
                <a
                  href="https://nextbigproduct.com/product/traderama-pro"
                  target="_blank"
                  rel="noopener"
                  className="block w-full sm:w-auto"
                >
                  <img
                    src="https://nextbigproduct.com/assets/badge/nbp_badge.png"
                    alt="Featured on NextBigProduct"
                    className="max-w-[250px] sm:max-w-[320px] w-full h-auto mx-auto sm:mx-0"
                  />
                </a>}
            </div>

            {/* Create Strategy Button - Only for authorized users */}
            {user &&
              (userRole === "strategy_creator" ||
                userRole === "admin" ||
                userRole === "super_admin") &&
              <Link to="/create-strategy" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600 flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Strategy
                </Button>
              </Link>}
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-gray-300 text-sm">
            {benefits.map((benefit, index) =>
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>
                  {benefit}
                </span>
              </div>,
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
