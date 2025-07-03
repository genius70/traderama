
import React from 'react';

interface MarketSummaryStatsProps {
  categories: string[];
  etfData: Record<string, any>;
  etfSymbols: Array<{ symbol: string; category: string }>;
}

const MarketSummaryStats: React.FC<MarketSummaryStatsProps> = ({ 
  categories, 
  etfData, 
  etfSymbols 
}) => {
  return (
    <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.slice(0, 4).map(category => {
        const categoryETFs = etfSymbols.filter(etf => etf.category === category);
        const avgChange = categoryETFs.reduce((sum, etf) => {
          const data = etfData[etf.symbol];
          return sum + (data ? parseFloat(data.changePercent) : 0);
        }, 0) / categoryETFs.length;
        
        return (
          <div key={category} className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
            <div className={`text-2xl font-bold ${avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500">{categoryETFs.length} ETFs</p>
          </div>
        );
      })}
    </div>
  );
};

export default MarketSummaryStats;
