import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StrategyBasicInfoProps {
  strategyName: string;
  setStrategyName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}

const categories = [
  'Options Trading',
  'Swing Trading',
  'Day Trading',
  'Scalping',
  'Mean Reversion',
  'Momentum',
  'Arbitrage'
];

const StrategyBasicInfo: React.FC<StrategyBasicInfoProps> = ({
  strategyName,
  setStrategyName,
  description,
  setDescription,
  category,
  setCategory
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Information</CardTitle>
        <CardDescription>Basic details about your trading strategy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Strategy Name *</Label>
          <Input
            id="name"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="e.g., Iron Condor Weekly Strategy"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your strategy, its logic, market outlook, and expected performance..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyBasicInfo;