import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp } from 'lucide-react';

const CopyTradingComponent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Copy Trading
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-8 text-gray-500">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Copy Trading Coming Soon</p>
            <p>Follow and copy trades from top performers automatically.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600">Top Performers</div>
              <div className="text-2xl font-bold text-green-600">142</div>
              <div className="text-xs text-gray-500">Available to copy</div>
            </Card>
            
            <Card className="p-4">
              <div className="text-sm text-gray-600">Average Return</div>
              <div className="text-2xl font-bold text-blue-600">+23.5%</div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </Card>
          </div>
          
          <Button className="w-full" disabled>
            Browse Copy Traders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CopyTradingComponent;
