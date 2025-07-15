
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, AlertTriangle, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from "@/components/layout/Header";
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';
import StrategyBasicInfo from '@/components/trading/StrategyBasicInfo';
import EnhancedTradingTemplate from '@/components/trading/EnhancedTradingTemplate';
import MockOptionsChain from '@/components/trading/MockOptionsChain';
import StrategyPreview from '@/components/trading/StrategyPreview';

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

interface TradingLeg {
  id?: string;
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
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
  const [legs, setLegs] = useState<TradingLeg[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleTemplateSelect = (option: { id: string; name: string; template: { legs: TradingLeg[] } }) => {
    setStrategyName(option.name);
    setCategory('Options Trading');
    setLegs(option.template.legs.map(leg => ({ ...leg, id: Date.now().toString() + Math.random() })));
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        variant: "destructive"
      });
      return;
    }

    if (!strategyName.trim() || !description.trim() || !category) {
      toast({
        title: "Missing information",
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
            strategy_config: { conditions, legs },
            status: 'draft'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Strategy created!"
      });

      // Reset form
      setStrategyName('');
      setDescription('');
      setCategory('');
      setConditions([]);
      setLegs([]);
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast({
        title: "Error creating strategy",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Header />
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
        <StrategyPreview
          strategyName={strategyName}
          description={description}
          category={category}
          isPremium={isPremium}
          feePercentage={feePercentage}
          legs={legs}
          conditions={conditions}
        />
      ) : (
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="legs">Options Legs</TabsTrigger>
            <TabsTrigger value="chain">Options Chain</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <TradingOptionsSelector onSelectOption={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="basic">
            <StrategyBasicInfo
              strategyName={strategyName}
              setStrategyName={setStrategyName}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
            />
          </TabsContent>

          <TabsContent value="legs">
            <EnhancedTradingTemplate
              strategyName={strategyName || 'Strategy'}
              legs={legs}
              onLegsChange={setLegs}
            />
          </TabsContent>

          <TabsContent value="chain">
            <MockOptionsChain
              onSelectContract={(contract) => {
                const newLeg: TradingLeg = {
                  id: Date.now().toString(),
                  strike: contract.strike.toString(),
                  type: contract.type,
                  expiration: '30',
                  buySell: 'Buy',
                  size: 1,
                  price: contract.ask.toFixed(2)
                };
                setLegs([...legs, newLeg]);
              }}
            />
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
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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
                    <p className="text-sm text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">% of profits</span>
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