
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Settings, TrendingUp } from 'lucide-react';
import { LiveTradingEngine } from '@/components/trading';
import Header from '@/components/layout/Header';

const AutoTrading = () => {
  const [strategies] = useState([
    { id: 1, name: 'Iron Condor Weekly', status: 'active', pnl: 450.25 },
    { id: 2, name: 'Momentum Scalping', status: 'paused', pnl: -125.50 },
    { id: 3, name: 'Mean Reversion', status: 'active', pnl: 280.75 },
  ]);

  return (
    <div className="space-y-6">
    <Header />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Trading</h1>
          <p className="text-gray-600">Automated trading strategies and live execution</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Live Trading Engine */}
      <LiveTradingEngine />

      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Strategies</CardTitle>
          <CardDescription>
            Monitor and manage your automated trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Switch defaultChecked={strategy.status === 'active'} />
                  <div>
                    <p className="font-medium">{strategy.name}</p>
                    <Badge variant={strategy.status === 'active' ? 'default' : 'secondary'}>
                      {strategy.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className={`font-medium ${
                      strategy.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {strategy.pnl >= 0 ? '+' : ''}${strategy.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Daily Loss Limit</Label>
              <p className="text-2xl font-bold text-red-600">$500</p>
              <p className="text-sm text-gray-500">Current: $125</p>
            </div>
            <div className="space-y-2">
              <Label>Max Position Size</Label>
              <p className="text-2xl font-bold">$5,000</p>
              <p className="text-sm text-gray-500">Per trade</p>
            </div>
            <div className="space-y-2">
              <Label>Open Positions</Label>
              <p className="text-2xl font-bold">7/10</p>
              <p className="text-sm text-gray-500">Maximum allowed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoTrading;
