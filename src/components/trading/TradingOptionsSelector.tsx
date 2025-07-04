import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradingOption {
  id: string;
  name: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  template: {
    strikes: number;
    legs: Array<{
      strike: string;
      type: 'Call' | 'Put';
      expiration: string;
      buySell: 'Buy' | 'Sell';
      size: number;
      price: string;
    }>;
  };
}

const tradingOptions: TradingOption[] = [
  {
    id: 'long-call',
    name: 'Long Call',
    type: 'Bullish',
    template: {
      strikes: 1,
      legs: [{ strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }]
    }
  },
  {
    id: 'short-call',
    name: 'Short Call',
    type: 'Bearish',
    template: {
      strikes: 1,
      legs: [{ strike: 'OTM', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }]
    }
  },
  {
    id: 'long-put',
    name: 'Long Put',
    type: 'Bearish',
    template: {
      strikes: 1,
      legs: [{ strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }]
    }
  },
  {
    id: 'short-put',
    name: 'Short Put',
    type: 'Bullish',
    template: {
      strikes: 1,
      legs: [{ strike: 'OTM', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }]
    }
  },
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    type: 'Bullish',
    template: {
      strikes: 2,
      legs: [
        { strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'bear-call-spread',
    name: 'Bear Call Spread',
    type: 'Bearish',
    template: {
      strikes: 2,
      legs: [
        { strike: 'OTM', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'Further OTM', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    type: 'Bearish',
    template: {
      strikes: 2,
      legs: [
        { strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'bull-put-spread',
    name: 'Bull Put Spread',
    type: 'Bullish',
    template: {
      strikes: 2,
      legs: [
        { strike: 'OTM', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'Further OTM', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'long-straddle',
    name: 'Long Straddle',
    type: 'Neutral',
    template: {
      strikes: 1,
      legs: [
        { strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'short-straddle',
    name: 'Short Straddle',
    type: 'Neutral',
    template: {
      strikes: 1,
      legs: [
        { strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'long-strangle',
    name: 'Long Strangle',
    type: 'Neutral',
    template: {
      strikes: 2,
      legs: [
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'short-strangle',
    name: 'Short Strangle',
    type: 'Neutral',
    template: {
      strikes: 2,
      legs: [
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'long-iron-butterfly',
    name: 'Long Iron Butterfly',
    type: 'Neutral',
    template: {
      strikes: 3,
      legs: [
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'short-iron-butterfly',
    name: 'Short Iron Butterfly',
    type: 'Neutral',
    template: {
      strikes: 3,
      legs: [
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'ATM', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'long-iron-condor',
    name: 'Long Iron Condor',
    type: 'Neutral',
    template: {
      strikes: 4,
      legs: [
        { strike: 'Far OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'Far OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' }
      ]
    }
  },
  {
    id: 'short-iron-condor',
    name: 'Short Iron Condor',
    type: 'Neutral',
    template: {
      strikes: 4,
      legs: [
        { strike: 'Far OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' },
        { strike: 'OTM Put', type: 'Put', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Buy', size: 1, price: 'Market' },
        { strike: 'Far OTM Call', type: 'Call', expiration: '30 DTE', buySell: 'Sell', size: 1, price: 'Market' }
      ]
    }
  }
];

interface TradingOptionsSelectorProps {
  onSelectOption: (option: TradingOption) => void;
  filter?: string;
}

const TradingOptionsSelector: React.FC<TradingOptionsSelectorProps> = ({ onSelectOption, filter }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleOptions = 4;

  const getFilteredOptions = () => {
    if (!filter) return tradingOptions;
    switch (filter) {
      case "bull":
        return tradingOptions.filter(opt => opt.type === "Bullish");
      case "bear":
        return tradingOptions.filter(opt => opt.type === "Bearish");
      case "neutral":
        return tradingOptions.filter(opt => opt.type === "Neutral");
      default:
        return tradingOptions;
    }
  };

  const filteredOptions = getFilteredOptions();

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  const nextOptions = () => {
    setCurrentIndex((prev) =>
      prev + visibleOptions >= filteredOptions.length ? 0 : prev + visibleOptions
    );
  };

  const prevOptions = () => {
    setCurrentIndex((prev) =>
      prev - visibleOptions < 0 ? Math.max(0, filteredOptions.length - visibleOptions) : prev - visibleOptions
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Bullish': return 'text-green-600 bg-green-50';
      case 'Bearish': return 'text-red-600 bg-red-50';
      case 'Neutral': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Trading Strategy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={prevOptions}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredOptions.slice(currentIndex, currentIndex + visibleOptions).map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => onSelectOption(option)}
              >
                <span className="font-semibold text-left">{option.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${getTypeColor(option.type)}`}>
                  {option.type}
                </span>
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={nextOptions}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingOptionsSelector;
