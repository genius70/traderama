import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, DollarSign, Shield, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface StrategyConfig {
  stopLoss?: number;
  profitTarget?: number;
  underlying?: string;
  timeframe?: string;
  [key: string]: unknown;
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  winRate: number;
  avgReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  config: StrategyConfig;
}

const StrategiesSection = () => {
  const strategies: Strategy[] = [
    {
      id: '1',
      title: 'Conservative Iron Condor',
      description: 'Low-risk strategy perfect for sideways markets with consistent monthly returns.',
      winRate: 85,
      avgReturn: 8.5,
      riskLevel: 'Low',
      config: { stopLoss: 50, profitTarget: 25, underlying: 'SPY', timeframe: '30-45 DTE' }
    },
    {
      id: '2', 
      title: 'Aggressive Iron Condor',
      description: 'Higher risk, higher reward strategy for experienced traders seeking maximum profits.',
      winRate: 72,
      avgReturn: 15.2,
      riskLevel: 'High',
      config: { stopLoss: 200, profitTarget: 50, underlying: 'QQQ', timeframe: '15-30 DTE' }
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proven Trading Strategies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered strategies have been backtested across multiple market conditions to ensure consistent performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-gray-50 rounded-lg p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{strategy.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  strategy.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                  strategy.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {strategy.riskLevel} Risk
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">{strategy.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{strategy.winRate}%</div>
                  <div className="text-gray-600">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{strategy.avgReturn}%</div>
                  <div className="text-gray-600">Avg Monthly Return</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Profit Target:</span>
                  <span>{strategy.config.profitTarget || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Underlying:</span>
                  <span>{strategy.config.underlying || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeframe:</span>
                  <span>{strategy.config.timeframe || 'N/A'}</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-8">
            Ready to start trading with our proven strategies?
          </p>
          <button className="bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default StrategiesSection;
