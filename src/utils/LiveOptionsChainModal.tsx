import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Clock, Activity } from 'lucide-react';

interface LiveOptionContract {
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  change: number;
  percentChange: number;
}

interface LiveOptionsChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  onSelectContract: (contract: LiveOptionContract & { type: 'Call' | 'Put'; expiry: string }) => void;
}

const LiveOptionsChainModal: React.FC<LiveOptionsChainModalProps> = ({
  isOpen,
  onClose,
  symbol,
  onSelectContract
}) => {
  const [calls, setCalls] = useState<LiveOptionContract[]>([]);
  const [puts, setPuts] = useState<LiveOptionContract[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState('2024-07-19');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [underlyingPrice, setUnderlyingPrice] = useState(0);

  // Mock data for demonstration - replace with real API calls
  const mockCalls: LiveOptionContract[] = [
    { strike: 520, bid: 12.45, ask: 12.60, last: 12.50, volume: 1250, openInterest: 3420, impliedVolatility: 0.28, delta: 0.65, gamma: 0.012, theta: -0.08, vega: 0.15, change: 0.25, percentChange: 2.04 },
    { strike: 525, bid: 9.85, ask: 10.00, last: 9.90, volume: 2100, openInterest: 5670, impliedVolatility: 0.26, delta: 0.58, gamma: 0.015, theta: -0.09, vega: 0.18, change: -0.15, percentChange: -1.49 },
    { strike: 530, bid: 7.60, ask: 7.75, last: 7.65, volume: 890, openInterest: 2340, impliedVolatility: 0.25, delta: 0.52, gamma: 0.018, theta: -0.10, vega: 0.20, change: 0.35, percentChange: 4.79 },
    { strike: 535, bid: 5.75, ask: 5.90, last: 5.80, volume: 1560, openInterest: 4120, impliedVolatility: 0.24, delta: 0.45, gamma: 0.020, theta: -0.11, vega: 0.22, change: 0.10, percentChange: 1.75 },
    { strike: 540, bid: 4.20, ask: 4.35, last: 4.25, volume: 780, openInterest: 1890, impliedVolatility: 0.23, delta: 0.38, gamma: 0.021, theta: -0.12, vega: 0.24, change: -0.05, percentChange: -1.16 }
  ];

  const mockPuts: LiveOptionContract[] = [
    { strike: 520, bid: 2.15, ask: 2.30, last: 2.20, volume: 950, openInterest: 2180, impliedVolatility: 0.29, delta: -0.35, gamma: 0.012, theta: -0.08, vega: 0.15, change: 0.05, percentChange: 2.33 },
    { strike: 525, bid: 3.40, ask: 3.55, last: 3.45, volume: 1420, openInterest: 3560, impliedVolatility: 0.27, delta: -0.42, gamma: 0.015, theta: -0.09, vega: 0.18, change: -0.10, percentChange: -2.82 },
    { strike: 530, bid: 5.10, ask: 5.25, last: 5.15, volume: 680, openInterest: 1950, impliedVolatility: 0.26, delta: -0.48, gamma: 0.018, theta: -0.10, vega: 0.20, change: 0.20, percentRange: 4.04 },
    { strike: 535, bid: 7.25, ask: 7.40, last: 7.30, volume: 1100, openInterest: 2780, impliedVolatility: 0.25, delta: -0.55, gamma: 0.020, theta: -0.11, vega: 0.22, change: 0.15, percentChange: 2.10 },
    { strike: 540, bid: 10.80, ask: 10.95, last: 10.85, volume: 520, openInterest: 1340, impliedVolatility: 0.24, delta: -0.62, gamma: 0.021, theta: -0.12, vega: 0.24, change: -0.25, percentChange: -2.25 }
  ];

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setCalls(mockCalls);
        setPuts(mockPuts);
        setUnderlyingPrice(527.45);
        setLoading(false);
        setLastUpdate(new Date());
      }, 1000);
    }
  }, [isOpen, selectedExpiry]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCalls(prev => prev.map(call => ({
        ...call,
        bid: call.bid + (Math.random() - 0.5) * 0.1,
        ask: call.ask + (Math.random() - 0.5) * 0.1,
        last: call.last + (Math.random() - 0.5) * 0.1
      })));
      
      setPuts(prev => prev.map(put => ({
        ...put,
        bid: put.bid + (Math.random() - 0.5) * 0.1,
        ask: put.ask + (Math.random() - 0.5) * 0.1,
        last: put.last + (Math.random() - 0.5) * 0.1
      })));
      
      setUnderlyingPrice(prev => prev + (Math.random() - 0.5) * 0.5);
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleContractSelect = (contract: LiveOptionContract, type: 'Call' | 'Put') => {
    onSelectContract({
      ...contract,
      type,
      expiry: selectedExpiry
    });
    onClose();
  };

  const formatPrice = (price: number) => price.toFixed(2);
  const formatPercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  const formatGreek = (value: number) => value.toFixed(3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Live Options Chain - {symbol}</h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Underlying: ${formatPrice(underlyingPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Update: {lastUpdate.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Expiration</label>
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="2024-07-19">Jul 19, 2024 (7 DTE)</option>
                <option value="2024-07-26">Jul 26, 2024 (14 DTE)</option>
                <option value="2024-08-16">Aug 16, 2024 (45 DTE)</option>
                <option value="2024-09-20">Sep 20, 2024 (82 DTE)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    orderType === 'market' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    orderType === 'limit' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Options Chain */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading live options data...</span>
            </div>
          ) : (
            <div className="flex">
              {/* Calls */}
              <div className="flex-1 border-r">
                <div className="bg-green-50 p-4 font-semibold text-green-800 border-b">
                  CALLS
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Strike</th>
                        <th className="p-2 text-right">Bid</th>
                        <th className="p-2 text-right">Ask</th>
                        <th className="p-2 text-right">Last</th>
                        <th className="p-2 text-right">Vol</th>
                        <th className="p-2 text-right">OI</th>
                        <th className="p-2 text-right">IV</th>
                        <th className="p-2 text-right">Δ</th>
                        <th className="p-2 text-right">Γ</th>
                        <th className="p-2 text-right">Θ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((call, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-green-50 cursor-pointer border-b transition-colors"
                          onClick={() => handleContractSelect(call, 'Call')}
                        >
                          <td className="p-2 font-semibold">${call.strike}</td>
                          <td className="p-2 text-right font-mono">{formatPrice(call.bid)}</td>
                          <td className="p-2 text-right font-mono">{formatPrice(call.ask)}</td>
                          <td className="p-2 text-right font-mono">
                            <div className="flex items-center justify-end gap-1">
                              {formatPrice(call.last)}
                              {call.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right text-gray-600">{call.volume.toLocaleString()}</td>
                          <td className="p-2 text-right text-gray-600">{call.openInterest.toLocaleString()}</td>
                          <td className="p-2 text-right">{formatPercent(call.impliedVolatility * 100)}</td>
                          <td className="p-2 text-right">{formatGreek(call.delta)}</td>
                          <td className="p-2 text-right">{formatGreek(call.gamma)}</td>
                          <td className="p-2 text-right text-red-600">{formatGreek(call.theta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Puts */}
              <div className="flex-1">
                <div className="bg-red-50 p-4 font-semibold text-red-800 border-b">
                  PUTS
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Strike</th>
                        <th className="p-2 text-right">Bid</th>
                        <th className="p-2 text-right">Ask</th>
                        <th className="p-2 text-right">Last</th>
                        <th className="p-2 text-right">Vol</th>
                        <th className="p-2 text-right">OI</th>
                        <th className="p-2 text-right">IV</th>
                        <th className="p-2 text-right">Δ</th>
                        <th className="p-2 text-right">Γ</th>
                        <th className="p-2 text-right">Θ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {puts.map((put, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-red-50 cursor-pointer border-b transition-colors"
                          onClick={() => handleContractSelect(put, 'Put')}
                        >
                          <td className="p-2 font-semibold">${put.strike}</td>
                          <td className="p-2 text-right font-mono">{formatPrice(put.bid)}</td>
                          <td className="p-2 text-right font-mono">{formatPrice(put.ask)}</td>
                          <td className="p-2 text-right font-mono">
                            <div className="flex items-center justify-end gap-1">
                              {formatPrice(put.last)}
                              {put.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right text-gray-600">{put.volume.toLocaleString()}</td>
                          <td className="p-2 text-right text-gray-600">{put.openInterest.toLocaleString()}</td>
                          <td className="p-2 text-right">{formatPercent(put.impliedVolatility * 100)}</td>
                          <td className="p-2 text-right text-red-600">{formatGreek(put.delta)}</td>
                          <td className="p-2 text-right">{formatGreek(put.gamma)}</td>
                          <td className="p-2 text-right text-red-600">{formatGreek(put.theta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Click on any contract to select it. Prices update in real-time.
            </div>
            <div className="flex gap-4">
              <span>Δ = Delta</span>
              <span>Γ = Gamma</span>
              <span>Θ = Theta</span>
              <span>IV = Implied Volatility</span>
              <span>Vol = Volume</span>
              <span>OI = Open Interest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOptionsChainModal;
