import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StrategyRiskMetrics from './StrategyRiskMetrics';

interface TradingLeg {
  id?: string;
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
}

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

interface StrategyPreviewProps {
  strategyName: string;
  description: string;
  category: string;
  isPremium: boolean;
  feePercentage: string;
  legs: TradingLeg[];
  conditions: StrategyCondition[];
}

const StrategyPreview: React.FC<StrategyPreviewProps> = ({
  strategyName,
  description,
  category,
  isPremium,
  feePercentage,
  legs,
  conditions
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{strategyName || 'Untitled Strategy'}</CardTitle>
            <div className="flex space-x-2">
              {isPremium && <Badge>Premium</Badge>}
              <Badge variant="outline">{category || 'Uncategorized'}</Badge>
            </div>
          </div>
          <CardDescription>{description || 'No description provided'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {legs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Options Strategy Legs:</h3>
                <div className="space-y-2">
                  {legs.map((leg, index) => (
                    <div key={leg.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={leg.buySell === 'Buy' ? 'default' : 'secondary'}>
                          {leg.buySell}
                        </Badge>
                        <Badge variant={leg.type === 'Call' ? 'outline' : 'secondary'}>
                          {leg.type}
                        </Badge>
                        <span className="font-medium">{leg.strike} Strike</span>
                        <span className="text-sm text-muted-foreground">{leg.expiration} DTE</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${leg.price} × {leg.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conditions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Strategy Conditions:</h3>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <div key={condition.id} className="p-3 border rounded-lg">
                      <Badge variant={condition.type === 'entry' ? 'default' : 'secondary'}>
                        {condition.type}
                      </Badge>
                      <p className="mt-1">
                        {condition.indicator} {condition.operator} {condition.value} ({condition.timeframe})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isPremium && (
              <div>
                <h3 className="font-semibold">Fee Structure:</h3>
                <p className="text-muted-foreground">{feePercentage}% of profits</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {legs.length > 0 && (
        <StrategyRiskMetrics 
          legs={legs} 
          strategyName={strategyName || 'Strategy'} 
        />
      )}
    </div>
  );
};

export default StrategyPreview;