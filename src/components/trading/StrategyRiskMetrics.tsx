import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface TradingLeg {
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
}

interface StrategyRiskMetricsProps {
  legs: TradingLeg[];
  strategyName: string;
}

const StrategyRiskMetrics: React.FC<StrategyRiskMetricsProps> = ({ legs, strategyName }) => {
  const calculateRiskMetrics = () => {
    if (legs.length === 0) return { maxProfit: 0, maxLoss: 0, breakeven: [] };

    // Simple calculation for demonstration
    let totalCredit = 0;
    let totalDebit = 0;

    legs.forEach(leg => {
      const price = parseFloat(leg.price) || 0;
      const size = leg.size || 1;
      
      if (leg.buySell === 'Sell') {
        totalCredit += price * size * 100; // Options are priced per share, contracts are 100 shares
      } else {
        totalDebit += price * size * 100;
      }
    });

    const netCredit = totalCredit - totalDebit;
    
    // Basic risk calculations (simplified)
    const maxProfit = netCredit > 0 ? netCredit : Math.abs(netCredit);
    const maxLoss = netCredit > 0 ? Math.abs(netCredit) : netCredit;

    return { maxProfit, maxLoss, breakeven: [] };
  };

  const { maxProfit, maxLoss } = calculateRiskMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Profit</p>
              <p className="text-2xl font-bold text-green-600">
                ${Math.abs(maxProfit).toFixed(0)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <div className="p-2 bg-red-100 rounded-full">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Loss</p>
              <p className="text-2xl font-bold text-red-600">
                ${Math.abs(maxLoss).toFixed(0)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk/Reward</p>
              <p className="text-2xl font-bold text-blue-600">
                {maxLoss !== 0 ? (maxProfit / Math.abs(maxLoss)).toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {legs.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Strategy Legs Summary</h4>
            <div className="space-y-2">
              {legs.map((leg, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge variant={leg.buySell === 'Buy' ? 'default' : 'secondary'}>
                      {leg.buySell}
                    </Badge>
                    <Badge variant={leg.type === 'Call' ? 'outline' : 'secondary'}>
                      {leg.type}
                    </Badge>
                    <span className="font-medium">{leg.strike}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{leg.expiration}</p>
                    <p className="font-medium">${leg.price} × {leg.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyRiskMetrics;