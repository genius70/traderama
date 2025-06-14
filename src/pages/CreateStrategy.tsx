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
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define interfaces
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

// Updated TradingOptionsSelector (4 per page, 2 rows)
const TradingOptionsSelector = ({ onSelectOption, filter }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const tradingStrategies = [
    { id: 1, name: "Iron Condor", description: "Neutral strategy with limited risk/reward", risk: "Low", complexity: "Medium" },
    { id: 2, name: "Bull Call Spread", description: "Bullish limited risk strategy", risk: "Medium", complexity: "Low" },
    { id: 3, name: "Bear Put Spread", description: "Bearish limited risk strategy", risk: "Medium", complexity: "Low" },
    { id: 4, name: "Straddle", description: "High volatility strategy", risk: "High", complexity: "Medium" },
    { id: 5, name: "Strangle", description: "Volatility play with wider strikes", risk: "High", complexity: "Medium" },
    { id: 6, name: "Butterfly", description: "Low volatility neutral strategy", risk: "Low", complexity: "High" },
    { id: 7, name: "Covered Call", description: "Income generation on stock holdings", risk: "Medium", complexity: "Low" },
    { id: 8, name: "Cash Secured Put", description: "Income with potential ownership", risk: "Medium", complexity: "Low" },
    { id: 9, name: "Iron Butterfly", description: "Neutral strategy at single strike", risk: "Low", complexity: "High" },
    { id: 10, name: "Calendar Spread", description: "Time decay strategy", risk: "Medium", complexity: "Medium" },
    { id: 11, name: "Diagonal Spread", description: "Time and price movement play", risk: "Medium", complexity: "High" },
    { id: 12, name: "Jade Lizard", description: "High probability income strategy", risk: "Medium", complexity: "High" },
    { id: 13, name: "Big Lizard", description: "Enhanced jade lizard", risk: "Medium", complexity: "High" },
    { id: 14, name: "Ratio Spread", description: "Unbalanced spread strategy", risk: "High", complexity: "High" },
    { id: 15, name: "Condor", description: "Wide body neutral strategy", risk: "Low", complexity: "Medium" },
    { id: 16, name: "Protective Put", description: "Downside protection for stocks", risk: "Low", complexity: "Low" },
    { id: 17, name: "Collar", description: "Protected stock position", risk: "Low", complexity: "Medium" },
    { id: 18, name: "Synthetic Long", description: "Stock equivalent using options", risk: "High", complexity: "Medium" },
    { id: 19, name: "Synthetic Short", description: "Short stock using options", risk: "High", complexity: "Medium" },
    { id: 20, name: "Box Spread", description: "Arbitrage strategy", risk: "Low", complexity: "High" },
    { id: 21, name: "Conversion", description: "Synthetic arbitrage", risk: "Low", complexity: "High" },
    { id: 22, name: "Reversal", description: "Opposite of conversion", risk: "Low", complexity: "High" },
    { id: 23, name: "Strip", description: "Modified straddle - bearish", risk: "High", complexity: "Medium" },
    { id: 24, name: "Strap", description: "Modified straddle - bullish", risk: "High", complexity: "Medium" },
    { id: 25, name: "Gut Strangle", description: "ITM strangle variation", risk: "High", complexity: "High" },
    { id: 26, name: "Christmas Tree", description: "Ratio butterfly spread", risk: "Medium", complexity: "High" },
    { id: 27, name: "Seagull", description: "Modified covered call", risk: "Medium", complexity: "High" },
    { id: 28, name: "Risk Reversal", description: "Synthetic stock position", risk: "High", complexity: "Medium" },
    { id: 29, name: "Fence", description: "Protective collar variant", risk: "Medium", complexity: "Medium" },
    { id: 30, name: "Custom Strategy", description: "Build your own combination", risk: "Variable", complexity: "Variable" }
  ];

  const strategiesPerPage = 4; // 4 per page as requested
  const totalPages = Math.ceil(tradingStrategies.length / strategiesPerPage);
  
  const getCurrentStrategies = () => {
    const startIndex = currentPage * strategiesPerPage;
    return tradingStrategies.slice(startIndex, startIndex + strategiesPerPage);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleSelectStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    if (onSelectOption) {
      onSelectOption({
        ...strategy,
        template: {
          legs: [
            {
              strike: "",
              type: "Call",
              expiration: "",
              buySell: "Buy",
              size: 1,
              price: ""
            }
          ]
        }
      });
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-purple-100 text-purple-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select Trading Strategy
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Choose from {tradingStrategies.length} options trading strategies (4 per page)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {getCurrentStrategies().map((strategy) => (
            <Card
              key={strategy.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                selectedStrategy?.id === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSelectStrategy(strategy)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm leading-tight">
                    {strategy.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {strategy.description}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">Risk:</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(strategy.risk)}`}>
                        {strategy.risk}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">Level:</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(strategy.complexity)}`}>
                        {strategy.complexity}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Page indicator dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentPage ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// TradingTemplate Component
const TradingTemplate = ({ strategyName, legs, onLegsChange }) => {
  if (!strategyName) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Template</CardTitle>
        <CardDescription>Configure legs for {strategyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DTE Range</Label>
              <div className="flex gap-2">
                <Input placeholder="30" className="w-20" />
                <span className="self-center text-sm">to</span>
                <Input placeholder="45" className="w-20" />
              </div>
            </div>
            <div>
              <Label>Delta Range</Label>
              <div className="flex gap-2">
                <Input placeholder="0.15" className="w-20" />
                <span className="self-center text-sm">to</span>
                <Input placeholder="0.30" className="w-20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Profit Target (%)</Label>
              <Input placeholder="25" />
            </div>
            <div>
              <Label>Stop Loss (%)</Label>
              <Input placeholder="200" />
            </div>
          </div>
          <div>
            <Label>IV Threshold</Label>
            <Input placeholder="20" />
          </div>
          <div className="pt-4">
            <Badge variant="outline" className="mb-2">
              Selected: {strategyName}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Template configuration will appear here based on your selection.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main CreateStrategy Component
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

  const [strategyFilter, setStrategyFilter] = useState<string>("bull");

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
              {/* Add horizontal filter tabs */}
              <div className="flex gap-3 mb-2 overflow-x-auto hide-scrollbar">
                {STRATEGY_FILTERS.map(filter =>
                  <button
                    key={filter.value}
                    onClick={() => setStrategyFilter(filter.value)}
                    className={`px-4 py-2 rounded-full font-medium border
                      ${strategyFilter === filter.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"}
                    `}
                  >
                    {filter.label}
                  </button>
                )}
              </div>
              {/* Pass filter to TradingOptionsSelector */}
              <TradingOptionsSelector 
                filter={strategyFilter}
                onSelectOption={handleTradingOptionSelect} 
              />
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
