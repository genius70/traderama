
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ETFData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  volume: number;
  high: string;
  low: string;
  timestamp: string;
}

interface ETFInfo {
  symbol: string;
  name: string;
  description: string;
  category: string;
}

interface ETFCardProps {
  etf: ETFInfo;
  data: ETFData | null;
  onSelect: (symbol: string) => void;
  isSelected: boolean;
}

const ETFCard: React.FC<ETFCardProps> = ({ etf, data, onSelect, isSelected }) => {
  const isPositive = parseFloat(data?.change || '0') >= 0;
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Core': 'bg-blue-100 text-blue-800',
      'Sector': 'bg-green-100 text-green-800',
      'International': 'bg-purple-100 text-purple-800',
      'Bonds': 'bg-yellow-100 text-yellow-800',
      'Style': 'bg-indigo-100 text-indigo-800',
      'Commodities': 'bg-orange-100 text-orange-800',
      'Real Estate': 'bg-red-100 text-red-800',
      'Thematic': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div 
      className={`w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-200'
      }`}
      onClick={() => onSelect(etf.symbol)}
    >
      <div className="flex justify-between items-start mb-3 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{etf.symbol}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(etf.category)}`}>
              {etf.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{etf.name}</p>
          <p className="text-xs text-gray-500 truncate">{etf.description}</p>
        </div>
        <div className={`p-2 rounded-full flex-shrink-0 ml-2 ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          {isPositive ? 
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> : 
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          }
        </div>
      </div>
      
      {data ? (
        <div className="space-y-2 w-full">
          <div className="flex justify-between items-center w-full">
            <span className="text-lg sm:text-2xl font-bold text-gray-900 truncate">${data.price}</span>
            <div className={`text-xs sm:text-sm font-semibold truncate ml-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{data.change} ({isPositive ? '+' : ''}{data.changePercent}%)
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 w-full">
            <div className="min-w-0">
              <span className="block text-xs text-gray-500">High</span>
              <span className="font-medium truncate">${data.high}</span>
            </div>
            <div className="min-w-0">
              <span className="block text-xs text-gray-500">Low</span>
              <span className="font-medium truncate">${data.low}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 truncate w-full">
            Volume: {data.volume?.toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="animate-pulse w-full">
          <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
        </div>
      )}
    </div>
  );
};

export default ETFCard;
