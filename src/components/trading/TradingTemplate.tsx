
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TradingLeg {
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
}

interface TradingTemplateProps {
  strategyName: string;
  legs: TradingLeg[];
  onLegsChange: (legs: TradingLeg[]) => void;
}

const TradingTemplate: React.FC<TradingTemplateProps> = ({ strategyName, legs, onLegsChange }) => {
  const updateLeg = (index: number, field: keyof TradingLeg, value: string | number) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    onLegsChange(newLegs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strategyName} Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Strike</th>
                <th className="text-left p-2 font-semibold">Type</th>
                <th className="text-left p-2 font-semibold">Expiration</th>
                <th className="text-left p-2 font-semibold">B/S</th>
                <th className="text-left p-2 font-semibold">Size</th>
                <th className="text-left p-2 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {legs.map((leg, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    <Input
                      value={leg.strike}
                      onChange={(e) => updateLeg(index, 'strike', e.target.value)}
                      placeholder="Strike price"
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Select 
                      value={leg.type} 
                      onValueChange={(value: 'Call' | 'Put') => updateLeg(index, 'type', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Put">Put</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      value={leg.expiration}
                      onChange={(e) => updateLeg(index, 'expiration', e.target.value)}
                      placeholder="DTE"
                      className="w-24"
                    />
                  </td>
                  <td className="p-2">
                    <Select 
                      value={leg.buySell} 
                      onValueChange={(value: 'Buy' | 'Sell') => updateLeg(index, 'buySell', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={leg.size}
                      onChange={(e) => updateLeg(index, 'size', parseInt(e.target.value) || 1)}
                      className="w-20"
                      min="1"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={leg.price}
                      onChange={(e) => updateLeg(index, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-24"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingTemplate;
