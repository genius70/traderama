
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import TradingOptionsSelector from "@/components/trading/TradingOptionsSelector";
import TradingTemplate from "@/components/trading/TradingTemplate";

interface TradingLeg {
  strike: string;
  type: 'Call' | 'Put';
  expiration: string;
  buySell: 'Buy' | 'Sell';
  size: number;
  price: string;
}

interface StrategyConfig {
  dteRange: number[];
  deltaRange: number[];
  profitTarget: number;
  stopLoss: number;
  ivThreshold: number;
  underlying: string;
  timeframe: string;
  tradingType: string;
  legs: TradingLeg[];
}

const CreateStrategy = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feePercentage, setFeePercentage] = useState(5);
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);
  const [selectedTradingOption, setSelectedTradingOption] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>({
    dteRange: [30, 45],
    deltaRange: [0.15, 0.30],
    profitTarget: 25,
    stopLoss: 200,
    ivThreshold: 20,
    underlying: 'SPY',
    timeframe: 'Weekly',
    tradingType: '',
    legs: []
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleTradingOptionSelect = (option: any) => {
    setSelectedTradingOption(option);
    setStrategyConfig(prev => ({
      ...prev,
      tradingType: option.name,
      legs: option.template.legs
    }));
  };

  const handleLegsChange = (legs: TradingLeg[]) => {
    setStrategyConfig(prev => ({
      ...prev,
      legs
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('trading_strategies')
        .insert({
          creator_id: user.id,
          title,
          description,
          fee_percentage: feePercentage,
          is_premium_only: isPremiumOnly,
          strategy_config: strategyConfig as any,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Strategy created successfully!",
        description: "Your trading strategy has been saved as a draft.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error creating strategy:', error);
      toast({
        title: "Error creating strategy",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Trading Strategy</h1>
            <p className="text-gray-600">Build and configure your trading strategy</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strategy Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Details</CardTitle>
                <CardDescription>Configure your trading strategy parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Strategy Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Conservative SPY Iron Condor"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your strategy, entry/exit rules, and risk management..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fee">Fee Percentage (5-25%)</Label>
                      <Input
                        id="fee"
                        type="number"
                        min="5"
                        max="25"
                        value={feePercentage}
                        onChange={(e) => setFeePercentage(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="underlying">Underlying Asset</Label>
                      <Select value={strategyConfig.underlying} onValueChange={(value) => 
                        setStrategyConfig(prev => ({ ...prev, underlying: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SPY">SPY</SelectItem>
                          <SelectItem value="QQQ">QQQ</SelectItem>
                          <SelectItem value="IWM">IWM</SelectItem>
                          <SelectItem value="AAPL">AAPL</SelectItem>
                          <SelectItem value="TSLA">TSLA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="premium"
                      checked={isPremiumOnly}
                      onCheckedChange={setIsPremiumOnly}
                    />
                    <Label htmlFor="premium">Premium Members Only</Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Strategy...' : 'Create Strategy'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Trading Options */}
            <div className="space-y-6">
              <TradingOptionsSelector onSelectOption={handleTradingOptionSelect} />

              {selectedTradingOption && (
                <TradingTemplate 
                  strategyName={selectedTradingOption.name}
                  legs={strategyConfig.legs}
                  onLegsChange={handleLegsChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStrategy;
