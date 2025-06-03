
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { TrendingUp, Settings, DollarSign, Shield, ArrowLeft } from 'lucide-react';

const CreateStrategy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState({
    title: '',
    description: '',
    underlying: 'SPY',
    timeframe: 'weekly',
    feePercentage: 10,
    isPremiumOnly: false,
    config: {
      dteRange: [7, 14],
      deltaRange: [15, 20],
      profitTarget: 25,
      stopLoss: 200,
      ivThreshold: 20
    }
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('trading_strategies')
        .insert({
          creator_id: user.id,
          title: strategy.title,
          description: strategy.description,
          fee_percentage: strategy.feePercentage,
          strategy_config: {
            underlying: strategy.underlying,
            timeframe: strategy.timeframe,
            ...strategy.config
          },
          is_premium_only: strategy.isPremiumOnly,
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Strategy Created!",
        description: "Your iron condor strategy has been published to the marketplace.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast({
        title: "Error",
        description: "Failed to create strategy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Iron Condor Strategy</h1>
              <p className="text-gray-600">Build and publish your trading strategy template</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Premium Feature
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Define the core details of your iron condor strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Strategy Title</Label>
                  <Input
                    id="title"
                    value={strategy.title}
                    onChange={(e) => setStrategy({ ...strategy, title: e.target.value })}
                    placeholder="e.g., SPY Weekly Iron Condor"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="underlying">Underlying Asset</Label>
                  <Select 
                    value={strategy.underlying} 
                    onValueChange={(value) => setStrategy({ ...strategy, underlying: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SPY">SPY - SPDR S&P 500 ETF</SelectItem>
                      <SelectItem value="QQQ">QQQ - Invesco QQQ Trust</SelectItem>
                      <SelectItem value="IWM">IWM - iShares Russell 2000</SelectItem>
                      <SelectItem value="DIA">DIA - SPDR Dow Jones</SelectItem>
                      <SelectItem value="TSLA">TSLA - Tesla Inc</SelectItem>
                      <SelectItem value="AAPL">AAPL - Apple Inc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Strategy Description</Label>
                <Textarea
                  id="description"
                  value={strategy.description}
                  onChange={(e) => setStrategy({ ...strategy, description: e.target.value })}
                  placeholder="Describe your iron condor strategy, target market conditions, and expected performance..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select 
                    value={strategy.timeframe} 
                    onValueChange={(value) => setStrategy({ ...strategy, timeframe: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (0-7 DTE)</SelectItem>
                      <SelectItem value="weekly">Weekly (7-14 DTE)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (14-21 DTE)</SelectItem>
                      <SelectItem value="monthly">Monthly (21-45 DTE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={strategy.isPremiumOnly}
                    onCheckedChange={(checked) => setStrategy({ ...strategy, isPremiumOnly: checked })}
                  />
                  <Label>Premium Only Strategy</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Strategy Parameters</span>
              </CardTitle>
              <CardDescription>
                Configure the technical parameters for your iron condor strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Days to Expiration (DTE) Range</Label>
                  <div className="mt-2">
                    <Slider
                      value={strategy.config.dteRange}
                      onValueChange={(value) => setStrategy({
                        ...strategy,
                        config: { ...strategy.config, dteRange: value }
                      })}
                      min={1}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{strategy.config.dteRange[0]} days</span>
                      <span>{strategy.config.dteRange[1]} days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Delta Range for Strikes</Label>
                  <div className="mt-2">
                    <Slider
                      value={strategy.config.deltaRange}
                      onValueChange={(value) => setStrategy({
                        ...strategy,
                        config: { ...strategy.config, deltaRange: value }
                      })}
                      min={5}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{strategy.config.deltaRange[0]} delta</span>
                      <span>{strategy.config.deltaRange[1]} delta</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Profit Target (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[strategy.config.profitTarget]}
                      onValueChange={(value) => setStrategy({
                        ...strategy,
                        config: { ...strategy.config, profitTarget: value[0] }
                      })}
                      min={10}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {strategy.config.profitTarget}%
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Stop Loss (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[strategy.config.stopLoss]}
                      onValueChange={(value) => setStrategy({
                        ...strategy,
                        config: { ...strategy.config, stopLoss: value[0] }
                      })}
                      min={100}
                      max={300}
                      step={25}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {strategy.config.stopLoss}%
                    </div>
                  </div>
                </div>

                <div>
                  <Label>IV Threshold (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[strategy.config.ivThreshold]}
                      onValueChange={(value) => setStrategy({
                        ...strategy,
                        config: { ...strategy.config, ivThreshold: value[0] }
                      })}
                      min={10}
                      max={50}
                      step={2}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">
                      {strategy.config.ivThreshold}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Fee Structure</span>
              </CardTitle>
              <CardDescription>
                Set your performance fee for strategy subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Performance Fee Percentage</Label>
                <div className="mt-2">
                  <Slider
                    value={[strategy.feePercentage]}
                    onValueChange={(value) => setStrategy({ ...strategy, feePercentage: value[0] })}
                    min={5}
                    max={25}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-500 mt-1">
                    {strategy.feePercentage}% fee on profits
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  You'll earn {strategy.feePercentage}% of the profits generated by users who subscribe to your strategy.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? 'Publishing...' : 'Publish Strategy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStrategy;
