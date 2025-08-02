import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

import { TradingLeg } from './types';

interface EnhancedTradingTemplateProps {
  strategyName: string;
  legs: TradingLeg[];
  onLegsChange: (legs: TradingLeg[]) => void;
}

const EnhancedTradingTemplate: React.FC<EnhancedTradingTemplateProps> = ({ 
  strategyName, 
  legs, 
  onLegsChange 
}) => {
  const updateLeg = (index: number, field: keyof TradingLeg, value: string | number) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    onLegsChange(newLegs);
  };

  const addLeg = () => {
    const newLeg: TradingLeg = {
      id: Date.now().toString(),
      strike: '',
      type: 'Call',
      expiration: '30',
      buySell: 'Buy',
      size: 1,
      price: '',
      underlying: 'SPY',
      epic: 'TEMPLATE_LEG'
    };
    onLegsChange([...legs, newLeg]);
  };

  const removeLeg = (index: number) => {
    const newLegs = legs.filter((_, i) => i !== index);
    onLegsChange(newLegs);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{strategyName} Configuration</CardTitle>
          <Button onClick={addLeg} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Leg
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {legs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No legs configured</p>
            <p className="text-sm">Add legs to build your options strategy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {legs.map((leg, index) => (
              <div key={leg.id || index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={leg.buySell === 'Buy' ? 'default' : 'secondary'}>
                      {leg.buySell}
                    </Badge>
                    <Badge variant={leg.type === 'Call' ? 'outline' : 'secondary'}>
                      {leg.type}
                    </Badge>
                    <span className="text-sm font-medium">Leg {index + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLeg(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <Select 
                      value={leg.buySell} 
                      onValueChange={(value: 'Buy' | 'Sell') => updateLeg(index, 'buySell', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={leg.type} 
                      onValueChange={(value: 'Call' | 'Put') => updateLeg(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Put">Put</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Strike</label>
                    <Input
                      value={leg.strike}
                      onChange={(e) => updateLeg(index, 'strike', e.target.value)}
                      placeholder="Strike"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">DTE</label>
                    <Input
                      value={leg.expiration}
                      onChange={(e) => updateLeg(index, 'expiration', e.target.value)}
                      placeholder="Days"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={leg.size}
                      onChange={(e) => updateLeg(index, 'size', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Premium</label>
                    <Input
                      value={leg.price}
                      onChange={(e) => updateLeg(index, 'price', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTradingTemplate;