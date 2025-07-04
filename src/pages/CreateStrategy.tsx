
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, AlertTriangle, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

const CreateStrategy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [strategyName, setStrategyName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [feePercentage, setFeePercentage] = useState('2');
  const [conditions, setConditions] = useState<StrategyCondition[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'Options Trading',
    'Swing Trading',
    'Day Trading',
    'Scalping',
    'Mean Reversion',
    'Momentum',
    'Arbitrage'
  ];

  const indicators = [
    'RSI',
    'MACD',
    'Moving Average',
    'Bollinger Bands',
    'Stochastic',
    'Volume',
    'Price Action'
  ];

  const operators = ['>', '<', '>=', '<=', '=', 'crosses above', 'crosses below'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const addCondition = () => {
    const newCondition: StrategyCondition = {
      id: Date.now().toString(),
      type: 'entry',
      indicator: '',
      operator: '',
      value: '',
      timeframe: '15m'
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, field: keyof StrategyCondition, value: string) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a strategy",
        variant: "destructive"
      });
      return;
    }

    if (!strategyName.trim() || !description.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('trading_strategies')
        .insert([
          {
            title: strategyName,
            description,
            category,
            is_premium_only: isPremium,
            fee_percentage: parseFloat(feePercentage),
            creator_id: user.id,
            conditions: conditions,
            status: 'draft'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Strategy created!",
        description: "Your trading strategy has been saved as a draft"
      });

      // Reset form
      setStrategyName('');
      setDescription('');
      setCategory('');
      setConditions([]);
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast({
        title: "Error creating strategy",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Trading Strategy</h1>
          <p className="text-gray-600">Build and share your automated trading strategies</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Strategy'}
          </Button>
        </div>
      </div>

      {isPreview ? (
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
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Strategy Conditions:</h3>
                {conditions.length === 0 ? (
                  <p className="text-gray-500">No conditions defined</p>
                ) : (
                  <div className="space-y-2">
                    {conditions.map((condition) => (
                      <div key={condition.id} className="p-3 border rounded">
                        <Badge variant={condition.type === 'entry' ? 'default' : 'secondary'}>
                          {condition.type}
                        </Badge>
                        <p className="mt-1">
                          {condition.indicator} {condition.operator} {condition.value} ({condition.timeframe})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {isPremium && (
                <div>
                  <h3 className="font-semibold">Fee Structure:</h3>
                  <p>{feePercentage}% of profits</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
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
                    placeholder="e.g., RSI Mean Reversion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your strategy, its logic, and expected performance..."
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
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calculator className="h-5 w-5 mr-2" />
                      Strategy Conditions
                    </CardTitle>
                    <CardDescription>Define entry and exit conditions for your strategy</CardDescription>
                  </div>
                  <Button onClick={addCondition}>Add Condition</Button>
                </div>
              </CardHeader>
              <CardContent>
                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conditions defined yet</p>
                    <p className="text-sm">Add conditions to define your strategy logic</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition) => (
                      <div key={condition.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <Select
                            value={condition.type}
                            onValueChange={(value) => updateCondition(condition.id, 'type', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entry">Entry</SelectItem>
                              <SelectItem value="exit">Exit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCondition(condition.id)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Select
                            value={condition.indicator}
                            onValueChange={(value) => updateCondition(condition.id, 'indicator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Indicator" />
                            </SelectTrigger>
                            <SelectContent>
                              {indicators.map((indicator) => (
                                <SelectItem key={indicator} value={indicator}>{indicator}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((operator) => (
                                <SelectItem key={operator} value={operator}>{operator}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            value={condition.value}
                            onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                            placeholder="Value"
                          />

                          <Select
                            value={condition.timeframe}
                            onValueChange={(value) => updateCondition(condition.id, 'timeframe', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeframes.map((tf) => (
                                <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Settings</CardTitle>
                <CardDescription>Configure pricing and access settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Premium Strategy</Label>
                    <p className="text-sm text-gray-500">
                      Charge users a fee to access this strategy
                    </p>
                  </div>
                  <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                </div>

                {isPremium && (
                  <div className="space-y-2">
                    <Label htmlFor="fee">Fee Percentage</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="fee"
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={feePercentage}
                        onChange={(e) => setFeePercentage(e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">% of profits</span>
                    </div>
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        You'll earn {feePercentage}% of the profits generated by users following this strategy.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CreateStrategy;
