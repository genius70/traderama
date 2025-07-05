import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Target, Shield, DollarSign, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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
  } | null;
}

interface StrategiesSectionProps {
  strategies: Strategy[];
  loading: boolean;
  user: any;
  onSubscribe: (strategyId: string) => Promise<void>;
}

const StrategiesSection: React.FC<StrategiesSectionProps> = ({ 
  strategies, 
  loading, 
  user, 
  onSubscribe 
}) => {
  const getRiskColor = (config: any): string => {
    if (!config || typeof config !== 'object') return 'text-gray-500';
    const stopLoss = config.stopLoss || 200;
    if (stopLoss <= 150) return 'text-green-500';
    if (stopLoss <= 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskLevel = (config: any): string => {
    if (!config || typeof config !== 'object') return 'Medium';
    const stopLoss = config.stopLoss || 200;
    if (stopLoss <= 150) return 'Low';
    if (stopLoss <= 200) return 'Medium';
    return 'High';
  };

  return (
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
                      onClick={() => onSubscribe(strategy.id)}
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
  );
};

export default StrategiesSection;