// src/components/trading/CreateStrategy.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, AlertTriangle, Save, Eye, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import TradingOptionsSelector from '@/components/trading/TradingOptionsSelector';
import StrategyBasicInfo from '@/components/trading/StrategyBasicInfo';
import EnhancedTradingTemplate from '@/components/trading/EnhancedTradingTemplate';
import StrategyPreview from '@/components/trading/StrategyPreview';
import { optimizeStrategy } from '@/utils/GeneticOptimizationEngine';
import { deployStrategyToBroker, fetchOptionsChain, fetchOptionsChainMetadata, IGAuthTokens } from '@/utils/igTradingAPI';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

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
  underlying: string;
  epic: string;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
  delta?: number;
  percentChange?: number;
}

interface StrategyTemplate {
  id: string;
  name: string;
  template: { legs: TradingLeg[]; conditions: StrategyCondition[] };
}

interface BacktestResult {
  id: string;
  strategyId: string;
  returns: number;
  sharpeRatio: number;
  maxDrawdown: number;
  trades: number;
  createdAt: string;
}

interface OptimizationResult {
  fitnessScore: number;
  optimizedConditions: StrategyCondition[];
  optimizedLegs: TradingLeg[];
  performanceMetrics: {
    returns: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

interface LiveOptionContract {
  epic: string;
  strike: number;
  type: 'Call' | 'Put';
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  percentChange: number;
  expiration: string;
  underlying: string;
}

const CreateStrategy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [strategyName, setStrategyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [feePercentage, setFeePercentage] = useState<string>('2');
  const [conditions, setConditions] = useState<StrategyCondition[]>([]);
  const [legs, setLegs] = useState<TradingLeg[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [symbol, setSymbol] = useState<string>('SPY'); // Default symbol
  const [expiry, setExpiry] = useState<string>(''); // Selected expiry
  const [availableExpirations, setAvailableExpirations] = useState<string[]>([]);
  const [contracts, setContracts] = useState<LiveOptionContract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchStrike, setSearchStrike] = useState<string>('');
  const [authTokens, setAuthTokens] = useState<IGAuthTokens | null>(null);
  const [selectedBuySell, setSelectedBuySell] = useState<{ [key: string]: 'Buy' | 'Sell' }>({}); // Buy/Sell per contract

  const indicators = [
    'RSI',
    'MACD',
    'Moving Average',
    'Bollinger Bands',
    'Stochastic',
    'Volume',
    'Price Action',
  ];

  const operators = ['>', '<', '>=', '<=', '=', 'crosses above', 'crosses below'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  const availableSymbols = ['SPY', 'QQQ', 'VIX', 'GOLD'];

  // Calculate expiration dates (30, 45, 75, 90, 180 days, 1–5 years)
  const calculateExpirationDates = () => {
    const today = new Date('2025-07-11');
    const days = [30, 45, 75, 90, 180];
    const years = [1, 2, 3, 4, 5];
    const expirations: string[] = [];

    days.forEach((d) => {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      expirations.push(date.toISOString().split('T')[0]); // e.g., '2025-08-10'
    });

    years.forEach((y) => {
      const date = new Date(today);
      date.setFullYear(today.getFullYear() + y);
      expirations.push(date.toISOString().split('T')[0]); // e.g., '2026-07-11'
    });

    return expirations.sort();
  };

  // Authenticate with IG API
  useEffect(() => {
    const authenticate = async () => {
      try {
        const tokens = await supabase.functions.invoke('get-auth-tokens', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.id}` },
        });
        setAuthTokens(tokens);
      } catch (err) {
        toast({
          title: 'Authentication Error',
          description: 'Unable to authenticate with the broker.',
          variant: 'destructive',
        });
      }
    };
    if (user) authenticate();
  }, [user, toast]);

  // Fetch expirations and options chain
  useEffect(() => {
    const fetchMetadataAndContracts = async () => {
      if (!authTokens || !user) return;
      try {
        setLoading(true);
        const { expirations } = await fetchOptionsChainMetadata(authTokens);
        const targetExpirations = calculateExpirationDates();
        const filteredExpirations = expirations
          .filter((exp) => targetExpirations.includes(exp) && new Date(exp) >= new Date('2025-08-10')) // Min 30 days
          .sort();
        setAvailableExpirations(filteredExpirations);
        if (filteredExpirations.length > 0 && !expiry) {
          setExpiry(filteredExpirations[0]); // Set default to nearest (min 30 days)
        }

        if (symbol && expiry) {
          const data = await fetchOptionsChain({ auth: authTokens, underlying: symbol, expiration: expiry });
          const enrichedData = data.map((contract) => ({
            ...contract,
            volume: Math.floor(Math.random() * 1000), // Mock volume
            openInterest: Math.floor(Math.random() * 500), // Mock open interest
            impliedVolatility: Math.random() * 0.5, // Mock IV
            delta: Math.random() * (contract.type === 'Call' ? 1 : -1), // Mock delta
            percentChange: (Math.random() - 0.5) * 10, // Mock percent change
          }));
          setContracts(enrichedData);
        }
      } catch (error) {
        console.error('Error fetching options data:', error);
        toast({
          title: 'Error fetching options data',
          description: 'Unable to load options chain.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    if (authTokens && user) fetchMetadataAndContracts();
  }, [authTokens, user, symbol, expiry, toast]);

  // Fetch backtest results from broker
  const fetchBacktestResults = async (strategyId: string) => {
    try {
      const response = await deployStrategyToBroker({ strategyId, action: 'backtest' });
      setBacktestResults(response.results || []);
    } catch (error) {
      console.error('Error fetching backtest results:', error);
      toast({
        title: 'Error fetching backtest results',
        description: 'Unable to retrieve results from the broker.',
        variant: 'destructive',
      });
    }
  };

  // Add a new condition
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

  // Update a condition
  const updateCondition = (id: string, field: keyof StrategyCondition, value: string) => {
    setConditions(conditions.map((condition) =>
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  // Remove a condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id));
  };

  // Handle template selection
  const handleTemplateSelect = (option: StrategyTemplate) => {
    setStrategyName(option.name);
    setCategory('Options Trading');
    setLegs(option.template.legs.map((leg) => ({ ...leg, id: Date.now().toString() + Math.random() })));
    setConditions(option.template.conditions.map((condition) => ({
      ...condition,
      id: Date.now().toString() + Math.random(),
    })));
    toast({
      title: 'Template loaded',
      description: `Loaded template: ${option.name}`,
    });
  };

  // Validate strategy conditions and legs
  const validateStrategy = (): boolean => {
    if (!strategyName.trim() || !description.trim() || !category) {
      toast({
        title: 'Missing basic information',
        description: 'Please provide strategy name, description, and category.',
        variant: 'destructive',
      });
      return false;
    }
    if (conditions.length === 0) {
      toast({
        title: 'No conditions defined',
        description: 'Please add at least one entry or exit condition.',
        variant: 'destructive',
      });
      return false;
    }
    if (legs.length === 0) {
      toast({
        title: 'No trading legs defined',
        description: 'Please add at least one trading leg.',
        variant: 'destructive',
      });
      return false;
    }
    for (const condition of conditions) {
      if (!condition.indicator || !condition.operator || !condition.value || !condition.timeframe) {
        toast({
          title: 'Incomplete condition',
          description: 'All conditions must have an indicator, operator, value, and timeframe.',
          variant: 'destructive',
        });
        return false;
      }
      if (isNaN(parseFloat(condition.value)) && condition.operator !== 'crosses above' && condition.operator !== 'crosses below') {
        toast({
          title: 'Invalid condition value',
          description: `Value for condition with ${condition.indicator} must be numeric.`,
          variant: 'destructive',
        });
        return false;
      }
    }
    for (const leg of legs) {
      if (!leg.strike || !leg.type || !leg.expiration || !leg.buySell || !leg.price || leg.size <= 0 || !leg.underlying || !leg.epic) {
        toast({
          title: 'Invalid trading leg',
          description: 'All legs must have valid strike, type, expiration, buy/sell, price, size, underlying, and epic.',
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  // Save strategy to Supabase
  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to save a strategy.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateStrategy()) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
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
            status: 'draft',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Strategy created!',
        description: `Strategy ${strategyName} saved as draft.`,
      });

      if (data?.id) {
        await fetchBacktestResults(data.id);
      }

      setStrategyName('');
      setDescription('');
      setCategory('');
      setConditions([]);
      setLegs([]);
      setOptimizationResult(null);
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast({
        title: 'Error creating strategy',
        description: 'Failed to save strategy to the database.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Deploy strategy to broker
  const handleDeploy = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to deploy a strategy.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateStrategy()) return;

    setIsDeploying(true);
    try {
      const strategyConfig = { conditions, legs, name: strategyName };
      const response = await deployStrategyToBroker({
        strategyId: Date.now().toString(),
        strategyConfig,
        action: 'deploy',
      });

      toast({
        title: 'Strategy deployed!',
        description: `Strategy ${strategyName} deployed to broker.`,
      });

      await fetchBacktestResults(response.strategyId);
    } catch (error) {
      console.error('Error deploying strategy:', error);
      toast({
        title: 'Error deploying strategy',
        description: 'Failed to deploy strategy to the broker.',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Run genetic optimization
  const handleOptimize = async () => {
    if (!validateStrategy()) return;

    setIsOptimizing(true);
    try {
      const result = await optimizeStrategy({ conditions, legs });
      setOptimizationResult(result);
      toast({
        title: 'Optimization complete!',
        description: 'Review optimized strategy parameters in the Optimization tab.',
      });
    } catch (error) {
      console.error('Error optimizing strategy:', error);
      toast({
        title: 'Error optimizing strategy',
        description: 'Failed to run genetic optimization.',
        variant: 'destructive',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply optimized parameters
  const applyOptimization = () => {
    if (optimizationResult) {
      setConditions(optimizationResult.optimizedConditions);
      setLegs(optimizationResult.optimizedLegs);
      toast({
        title: 'Optimization applied',
        description: 'Strategy updated with optimized parameters.',
      });
      setOptimizationResult(null);
    }
  };

  const filteredContracts = contracts.filter((contract) =>
    !searchStrike || contract.strike.toString().includes(searchStrike)
  );
  const callContracts = filteredContracts.filter((c) => c.type === 'Call');
  const putContracts = filteredContracts.filter((c) => c.type === 'Put');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Header />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Trading Strategy</h1>
          <p className="text-gray-600">Build and deploy automated trading strategies</p>
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
          <Button onClick={handleDeploy} disabled={isDeploying}>
            <Upload className="h-4 w-4 mr-2" />
            {isDeploying ? 'Deploying...' : 'Deploy to Broker'}
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="chain">Options Chain</TabsTrigger>
            <TabsTrigger value="legs">Options Legs</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
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

          <TabsContent value="chain">
            <Card>
              <CardHeader>
                <CardTitle>Options Chain - {symbol}</CardTitle>
                <CardDescription>Select an options contract to add to your strategy</CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Underlying Asset</Label>
                    <Select value={symbol} onValueChange={setSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select underlying" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSymbols.map((asset) => (
                          <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expiration Date</Label>
                    <Select value={expiry} onValueChange={setExpiry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableExpirations.map((exp) => (
                          <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Filter by strike..."
                      value={searchStrike}
                      onChange={(e) => setSearchStrike(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading options chain...</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Calls */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-green-600">Calls</h3>
                      <div className="space-y-2">
                        {callContracts.map((contract, idx) => (
                          <div
                            key={`call-${idx}`}
                            className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <div>
                              <span className="font-medium">${contract.strike}</span>
                              <Badge variant="outline" className="ml-2">Call</Badge>
                              <div className="text-xs text-gray-600 mt-2">
                                <span>IV: {(contract.impliedVolatility * 100).toFixed(1)}%</span>
                                <span className="ml-2">Δ: {contract.delta.toFixed(3)}</span>
                                <span
                                  className={
                                    contract.percentChange >= 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'
                                  }
                                >
                                  {contract.percentChange >= 0 ? '+' : ''}{contract.percentChange.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <div className="text-sm">
                                  Bid: ${contract.bid.toFixed(2)} | Ask: ${contract.ask.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Vol: {contract.volume} | OI: {contract.openInterest}
                                </div>
                              </div>
                              <Select
                                value={selectedBuySell[contract.epic] || 'Buy'}
                                onValueChange={(value) => setSelectedBuySell({
                                  ...selectedBuySell,
                                  [contract.epic]: value as 'Buy' | 'Sell',
                                })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Buy">Buy</SelectItem>
                                  <SelectItem value="Sell">Sell</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newLeg: TradingLeg = {
                                    id: Date.now().toString(),
                                    strike: contract.strike.toString(),
                                    type: contract.type,
                                    expiration: contract.expiration,
                                    buySell: selectedBuySell[contract.epic] || 'Buy',
                                    size: 1,
                                    price: contract.ask.toFixed(2),
                                    underlying: contract.underlying,
                                    epic: contract.epic,
                                    volume: contract.volume,
                                    openInterest: contract.openInterest,
                                    impliedVolatility: contract.impliedVolatility,
                                    delta: contract.delta,
                                    percentChange: contract.percentChange,
                                  };
                                  setLegs([...legs, newLeg]);
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Puts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">Puts</h3>
                      <div className="space-y-2">
                        {putContracts.map((contract, idx) => (
                          <div
                            key={`put-${idx}`}
                            className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <div>
                              <span className="font-medium">${contract.strike}</span>
                              <Badge variant="outline" className="ml-2">Put</Badge>
                              <div className="text-xs text-gray-600 mt-2">
                                <span>IV: {(contract.impliedVolatility * 100).toFixed(1)}%</span>
                                <span className="ml-2">Δ: {contract.delta.toFixed(3)}</span>
                                <span
                                  className={
                                    contract.percentChange >= 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'
                                  }
                                >
                                  {contract.percentChange >= 0 ? '+' : ''}{contract.percentChange.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-2">
                              <div>
                                <div className="text-sm">
                                  Bid: ${contract.bid.toFixed(2)} | Ask: ${contract.ask.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Vol: {contract.volume} | OI: {contract.openInterest}
                                </div>
                              </div>
                              <Select
                                value={selectedBuySell[contract.epic] || 'Buy'}
                                onValueChange={(value) => setSelectedBuySell({
                                  ...selectedBuySell,
                                  [contract.epic]: value as 'Buy' | 'Sell',
                                })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Buy">Buy</SelectItem>
                                  <SelectItem value="Sell">Sell</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newLeg: TradingLeg = {
                                    id: Date.now().toString(),
                                    strike: contract.strike.toString(),
                                    type: contract.type,
                                    expiration: contract.expiration,
                                    buySell: selectedBuySell[contract.epic] || 'Buy',
                                    size: 1,
                                    price: contract.ask.toFixed(2),
                                    underlying: contract.underlying,
                                    epic: contract.epic,
                                    volume: contract.volume,
                                    openInterest: contract.openInterest,
                                    impliedVolatility: contract.impliedVolatility,
                                    delta: contract.delta,
                                    percentChange: contract.percentChange,
                                  };
                                  setLegs([...legs, newLeg]);
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legs">
            <EnhancedTradingTemplate
              strategyName={strategyName || 'Strategy'}
              legs={legs}
              onLegsChange={setLegs}
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

          <TabsContent value="optimization">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Optimization</CardTitle>
                <CardDescription>Optimize your strategy using genetic algorithms and review broker backtest results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={handleOptimize} disabled={isOptimizing}>
                  <Calculator className="h-4 w-4 mr-2" />
                  {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                </Button>
                {optimizationResult && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Optimization Results</h3>
                      <p>Fitness Score: {optimizationResult.fitnessScore.toFixed(2)}</p>
                      <p>Expected Returns: {optimizationResult.performanceMetrics.returns.toFixed(2)}%</p>
                      <p>Sharpe Ratio: {optimizationResult.performanceMetrics.sharpeRatio.toFixed(2)}</p>
                      <p>Max Drawdown: {optimizationResult.performanceMetrics.maxDrawdown.toFixed(2)}%</p>
                    </div>
                    <Button onClick={applyOptimization}>Apply Optimized Parameters</Button>
                  </div>
                )}
                {backtestResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Broker Backtest Results</h3>
                    {backtestResults.map((result) => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <p>Returns: {result.returns.toFixed(2)}%</p>
                        <p>Sharpe Ratio: {result.sharpeRatio.toFixed(2)}</p>
                        <p>Max Drawdown: {result.maxDrawdown.toFixed(2)}%</p>
                        <p>Trades: {result.trades}</p>
                        <p>Tested: {new Date(result.createdAt).toLocaleDateString()}</p>
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
