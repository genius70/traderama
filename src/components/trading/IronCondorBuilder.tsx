import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface IronCondorConfig {
  symbol: string;
  expiration: string;
  callShortStrike: number;
  callLongStrike: number;
  putShortStrike: number;
  putLongStrike: number;
  contracts: number;
}

const IronCondorBuilder = () => {
  const [config, setConfig] = useState<IronCondorConfig>({
    symbol: 'SPY',
    expiration: '',
    callShortStrike: 0,
    callLongStrike: 0,
    putShortStrike: 0,
    putLongStrike: 0,
    contracts: 1,
  });

  const [analysis, setAnalysis] = useState({
    maxProfit: 0,
    maxLoss: 0,
    breakeven1: 0,
    breakeven2: 0,
    creditReceived: 0,
  });

  const calculateProfitLoss = () => {
    const callSpreadWidth = config.callLongStrike - config.callShortStrike;
    const putSpreadWidth = config.putLongStrike - config.putShortStrike;
    
    // Simplified calculation - in real implementation would use options pricing models
    const maxLoss = Math.max(callSpreadWidth, putSpreadWidth) * 100 * config.contracts;
    const creditReceived = 200 * config.contracts; // Placeholder
    const maxProfit = creditReceived;
    
    const breakeven1 = config.putShortStrike - (creditReceived / 100 / config.contracts);
    const breakeven2 = config.callShortStrike + (creditReceived / 100 / config.contracts);

    setAnalysis({
      maxProfit,
      maxLoss,
      breakeven1,
      breakeven2,
      creditReceived,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Iron Condor Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Select value={config.symbol} onValueChange={(value) => setConfig({...config, symbol: value})}>
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

          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration</Label>
            <Input
              type="date"
              value={config.expiration}
              onChange={(e) => setConfig({...config, expiration: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Call Spread</span>
            </h3>
            <div className="space-y-2">
              <Label>Short Strike</Label>
              <Input
                type="number"
                step="0.01"
                value={config.callShortStrike || ''}
                onChange={(e) => setConfig({...config, callShortStrike: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Long Strike</Label>
              <Input
                type="number"
                step="0.01"
                value={config.callLongStrike || ''}
                onChange={(e) => setConfig({...config, callLongStrike: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>Put Spread</span>
            </h3>
            <div className="space-y-2">
              <Label>Short Strike</Label>
              <Input
                type="number"
                step="0.01"
                value={config.putShortStrike || ''}
                onChange={(e) => setConfig({...config, putShortStrike: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label>Long Strike</Label>
              <Input
                type="number"
                step="0.01"
                value={config.putLongStrike || ''}
                onChange={(e) => setConfig({...config, putLongStrike: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Contracts</Label>
          <Input
            type="number"
            min="1"
            value={config.contracts}
            onChange={(e) => setConfig({...config, contracts: parseInt(e.target.value) || 1})}
          />
        </div>

        <Button onClick={calculateProfitLoss} className="w-full">
          Calculate P&L
        </Button>

        {analysis.maxProfit > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Max Profit</p>
              <p className="text-lg font-semibold text-green-600">${analysis.maxProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Loss</p>
              <p className="text-lg font-semibold text-red-600">${analysis.maxLoss.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lower Breakeven</p>
              <p className="text-lg font-semibold">${analysis.breakeven1.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upper Breakeven</p>
              <p className="text-lg font-semibold">${analysis.breakeven2.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IronCondorBuilder;
