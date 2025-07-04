import React from "react";

interface MarketStat {
  changePercent?: number;
  [key: string]: unknown;
}

const MarketSummaryStats = () => {
  const marketStats: Record<string, MarketStat> = {
    spy: { changePercent: 1.2 },
    qqq: { changePercent: -0.8 },
    iwm: { changePercent: 0.5 }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(marketStats).map(([symbol, stats]) => (
        <div key={symbol} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{symbol.toUpperCase()}</h3>
          <div className={`text-2xl font-bold ${
            (stats.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {(stats.changePercent || 0) >= 0 ? '+' : ''}{stats.changePercent || 0}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketSummaryStats;
