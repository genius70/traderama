import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  PlusCircle,
  BarChart3,
  Target,
  Star,
} from "lucide-react";

const CreatorDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Strategy Creator Dashboard
          </CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium">Active Strategies:</span>
              <span className="ml-auto text-sm text-green-500">8</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Total Performance:</span>
              <span className="ml-auto text-sm text-blue-500">+15.2%</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Followers:</span>
              <span className="ml-auto text-sm text-purple-500">142</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Revenue Generated:</span>
              <span className="ml-auto text-sm text-orange-500">$2,340</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Build and deploy new trading strategies with advanced tools and
              backtesting capabilities.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Strategy Templates
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Best Performing Strategy</span>
                <span className="text-green-500">+24.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Return</span>
                <span className="text-blue-500">+15.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Win Rate</span>
                <span className="text-purple-500">68%</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Strategy Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">
                  Momentum Strategy #1
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-500">+3.2%</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium">Mean Reversion Bot</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-500">+1.8%</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm font-medium">
                  Scalping Strategy v2
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-500">+0.9%</div>
                <div className="text-xs text-muted-foreground">2 days ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
