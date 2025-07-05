import React from "react";
import { TrendingUp, ArrowRight, Plus, CheckCircle } from "lucide-react";

const HeroSection = () => {
  const benefits = [
    "No Hidden Fees",
    "24/7 Support",
    "Instant Setup",
    "Professional Tools",
  ];

  // Mock user state - in real app this would come from context/props
  const user = null; // Set to true to see the Create Strategy button

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 opacity-10" />
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
              Copy successful traders, automate your strategies, and connect to
              top brokers. Join thousands of traders maximizing their options
              trading potential.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/auth">
                <button className="w-full sm:w-auto px-8 py-4 text-lg bg-blue-600 hover:bg-red-600 text-white transition-all duration-300 rounded-lg font-medium flex items-center justify-center">
                  Start Trading Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </a>
              {user &&
                <a href="/create-strategy">
                  <button className="w-full sm:w-auto px-8 py-4 text-lg bg-red-600 hover:bg-white hover:text-black text-white border-2 border-red-600 hover:border-red-600 rounded-lg font-medium flex items-center justify-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Strategy
                  </button>
                </a>}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-300 text-sm">
              {benefits.map((benefit, index) =>
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>
                    {benefit}
                  </span>
                </div>,
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
