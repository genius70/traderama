import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, AlertTriangle, Save, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';
import SavedStrategies from '@/components/trading/SavedStrategies';
import StrategyBasicInfo from '@/components/trading/StrategyBasicInfo';
import EnhancedTradingTemplate from '@/components/trading/EnhancedTradingTemplate';
import LiveOptionsChain from '@/components/trading/LiveOptionsChain';
import StrategyPreview from '@/components/trading/StrategyPreview';
import { authenticateIG } from '@/utils/igTradingAPI';
import { format, addWeeks, isFriday, nextFriday } from 'date-fns';

interface StrategyCondition {
  id: string;
  type: 'entry' | 'exit';
  indicator: string;
  operator: string;
  value: string;
  timeframe: string;
}

interface TradingLeg {
  id: string;
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
  limitPrice?: string;
  underlying: string;
  epic: string;
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    impliedVolatility: number;
  };
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [selectedUnderlying, setSelectedUnderlying] = useState<string>('SPY');
  const [optionsChainData, setOptionsChainData] = useState<any[]>([]);

  const indicators = ['RSI', 'MACD', 'Moving Average', 'Bollinger Bands', 'Stochastic', 'Volume', 'Price Action'];
  const operators = ['>', '<', '>=', '<=', '=', 'crosses above', 'crosses below'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  const underlyings = ['SPY', 'QQQ', 'IWM', 'GLD', 'SLV'];

  const getWeeklyExpirations = () => {
    const expirations: string[] = [];
    let currentDate = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 24);

    while (currentDate <= maxDate) {
      if (isFriday(currentDate)) {
        expirations.push(format(currentDate, 'yyyy-MM-dd'));
      }
      currentDate = nextFriday(addWeeks(currentDate, 1));
    }
    return expirations;
  };

  const weeklyExpirations = getWeeklyExpirations();

  useEffect(() => {
    const authenticate = async () => {
      try {
        await authenticateIG();
        if (weeklyExpirations.length > 0) {
          setSelectedExpiration(weeklyExpirations[0]);
        }
      } catch (err) {
        toast({
          title: 'Authentication Error',
          variant: 'destructive',
        });
      }
    };
    authenticate();
  }, [toast]);

  useEffect(() => {
    const fetchOptionsChain = async () => {
      if (!selectedUnderlying || !selectedExpiration) return;
      try {
        // Mock options chain data since LiveOptionsChain.fetchOptionsData doesn't exist
        const mockData = [];
        setOptionsChainData(mockData);
      } catch (error) {
        toast({
          title: 'Error fetching options chain',
          variant: 'destructive',
        });
      }
    };
    fetchOptionsChain();
  }, [selectedUnderlying, selectedExpiration, toast]);

  const addCondition = () => {
    const newCondition: StrategyCondition = {
      id: Date.now().toString(),
      type: 'entry',
      indicator: '',
      operator: '',
      value: '',
      timeframe: '15m',
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, field: keyof StrategyCondition, value: string) => {
    setConditions(conditions.map((condition) => (condition.id === id ? { ...condition, [field]: value } : condition)));
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id));
  };

  const handleTemplateSelect = (option: any) => {
    setStrategyName(option.name);
    setCategory('Options Trading');
    // Create proper TradingLeg objects from template
    const templateLegs = option.template.legs.map((leg: any) => ({
      id: Date.now().toString() + Math.random(),
      strike: leg.strike,
      type: leg.type,
      expiration: selectedExpiration || weeklyExpirations[0],
      buySell: leg.buySell,
      size: leg.size,
      price: leg.price,
      underlying: selectedUnderlying,
      epic: `LIVE_${leg.strike}_${leg.type}`,
    }));
    setLegs(templateLegs);
  };

  const handleSelectContract = (contract: {
    strike: number;
    type: 'Call' | 'Put';
    bid: number;
    ask: number;
    underlying: string;
    epic: string;
    greeks: { delta: number; gamma: number; theta: number; vega: number; impliedVolatility: number };
  }) => {
    const newLeg: TradingLeg = {
      id: Date.now().toString(),
      strike: contract.strike.toString(),
      type: contract.type,
      expiration: selectedExpiration || weeklyExpirations[0],
      buySell: 'Buy',
      size: 1,
      price: contract.ask.toFixed(2),
      limitPrice: contract.ask.toFixed(2),
      underlying: contract.underlying,
      epic: contract.epic,
      greeks: contract.greeks,
    };
    setLegs([...legs, newLeg]);
  };

  const handleUpdateLeg = (id: string, field: keyof TradingLeg, value: any) => {
    setLegs(legs.map((leg) => (leg.id === id ? { ...leg, [field]: value } : leg)));
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Authentication required', variant: 'destructive' });
      return;
    }

    if (!strategyName.trim() || !description.trim() || !category) {
      toast({ title: 'Missing information', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .insert({
          title: strategyName,
          description,
          creator_id: user.id,
          strategy_config: JSON.stringify({ conditions, legs }),
          fee_percentage: parseFloat(feePercentage),
          is_premium_only: isPremium,
          status: 'pending_review' as const,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Strategy Submitted',
      });

      setStrategyName('');
      setDescription('');
      setCategory('');
      setConditions([]);
      setLegs([]);
      setSelectedExpiration(weeklyExpirations[0]);
      setSelectedUnderlying('SPY');
    } catch (error) {
      console.error('Error submitting strategy:', error);
      toast({ title: 'Error submitting strategy', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const submitForApproval = async () => {
    if (!user) {
      toast({ title: 'Please sign in to submit strategies for approval', variant: 'destructive' });
      return;
    }

    if (!strategyName.trim()) {
      toast({ title: 'Please enter a strategy name', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const strategyConfig = {
        legs: legs,
        conditions,
        underlying: selectedUnderlying,
        expiration: selectedExpiration
      };

      const { error } = await supabase.from('trading_strategies').insert({
        title: strategyName,
        description: description,
        creator_id: user.id,
        strategy_config: JSON.stringify(strategyConfig),
        fee_percentage: parseFloat(feePercentage),
        is_premium_only: isPremium,
        status: 'pending_review',
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: 'Strategy submitted for approval successfully!' });
      
      // Reset form
      setStrategyName('');
      setDescription('');
      setCategory('');
      setLegs([]);
      setConditions([]);
      setFeePercentage('2');
      setIsPremium(false);
    } catch (error) {
      console.error('Error submitting strategy:', error);
      toast({ title: 'Error submitting strategy for approval', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadStrategy = (strategy: any) => {
    setStrategyName(strategy.title);
    setDescription(strategy.description || '');
    setFeePercentage((strategy.fee_percentage || 0).toString());
    setIsPremium(strategy.is_premium_only || false);

    try {
      const config = typeof strategy.strategy_config === 'string' 
        ? JSON.parse(strategy.strategy_config) 
        : strategy.strategy_config;
      
      if (config.legs) {
        setLegs(config.legs);
      }
      if (config.conditions) {
        setConditions(config.conditions);
      }
    } catch (error) {
      console.error('Error parsing strategy config:', error);
    }

    toast({ title: `Strategy "${strategy.title}" loaded successfully` });
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
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={submitForApproval} disabled={isSubmitting || !strategyName.trim()}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit for Approval
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
            <TabsTrigger value="chain">Options Chain</TabsTrigger>
            <TabsTrigger value="legs">Options Legs</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-6">
              <SavedStrategies onLoadStrategy={loadStrategy} />
              <TradingOptionsSelector onSelectOption={handleTemplateSelect} />
            </div>
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

          <TabsContent value="chain">
            <Card>
              <CardHeader>
                <CardTitle>Options Chain</CardTitle>
                <CardDescription>Select an options contract to add to your strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="underlying">Underlying Asset</Label>
                    <Select
                      value={selectedUnderlying}
                      onValueChange={setSelectedUnderlying}
                    >
                      <SelectTrigger id="underlying">
                        <SelectValue placeholder="Select underlying" />
                      </SelectTrigger>
                      <SelectContent>
                        {underlyings.map((asset) => (
                          <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiration">Expiration Date</Label>
                    <Select
                      value={selectedExpiration}
                      onValueChange={setSelectedExpiration}
                    >
                      <SelectTrigger id="expiration">
                        <SelectValue placeholder="Select expiration date" />
                      </SelectTrigger>
                      <SelectContent>
                        {weeklyExpirations.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), 'MMM dd, yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {optionsChainData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Strike</TableHead>
                        <TableHead>Bid</TableHead>
                        <TableHead>Ask</TableHead>
                        <TableHead>Delta</TableHead>
                        <TableHead>Gamma</TableHead>
                        <TableHead>Theta</TableHead>
                        <TableHead>Vega</TableHead>
                        <TableHead>IV</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {optionsChainData.map((contract) => (
                        <TableRow key={`${contract.type}-${contract.strike}`}>
                          <TableCell>{contract.type}</TableCell>
                          <TableCell>{contract.strike}</TableCell>
                          <TableCell>{contract.bid.toFixed(2)}</TableCell>
                          <TableCell>{contract.ask.toFixed(2)}</TableCell>
                          <TableCell>{contract.greeks.delta.toFixed(3)}</TableCell>
                          <TableCell>{contract.greeks.gamma.toFixed(3)}</TableCell>
                          <TableCell>{contract.greeks.theta.toFixed(3)}</TableCell>
                          <TableCell>{contract.greeks.vega.toFixed(3)}</TableCell>
                          <TableCell>{contract.greeks.impliedVolatility.toFixed(2)}%</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSelectContract(contract)}
                            >
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                    <p>No options data available</p>
                    <p className="text-sm">Select an underlying asset and expiration date to view options</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legs">
            <Card>
              <CardHeader>
                <CardTitle>Options Legs</CardTitle>
                <CardDescription>Configure the legs of your trading strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedTradingTemplate
                  strategyName={strategyName || 'Strategy'}
                  legs={legs}
                  onLegsChange={(newLegs: any[]) => setLegs(newLegs.map(leg => ({ ...leg, id: leg.id || Date.now().toString() })))}
                />
                {legs.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Underlying</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Strike</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Buy/Sell</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Market Price</TableHead>
                        <TableHead>Limit Price</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {legs.map((leg) => (
                        <TableRow key={leg.id}>
                          <TableCell>{leg.underlying}</TableCell>
                          <TableCell>{leg.type}</TableCell>
                          <TableCell>{leg.strike}</TableCell>
                          <TableCell>{format(new Date(leg.expiration), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Select
                              value={leg.buySell}
                              onValueChange={(value) => handleUpdateLeg(leg.id, 'buySell', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Buy">Buy</SelectItem>
                                <SelectItem value="Sell">Sell</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={leg.size}
                              onChange={(e) => handleUpdateLeg(leg.id, 'size', parseInt(e.target.value))}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{leg.price}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={leg.limitPrice || leg.price}
                              onChange={(e) => handleUpdateLeg(leg.id, 'limitPrice', e.target.value)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setLegs(legs.filter((l) => l.id !== leg.id))}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
