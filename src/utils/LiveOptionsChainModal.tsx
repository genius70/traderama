import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interface for Polygon.io options contract data
interface LiveOptionContract {
  epic: string; // Maps to Polygon.io's contract ticker (e.g., O:SPY250117C00450000)
  strike: number;
  type: 'Call' | 'Put';
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number; // Note: May require third-party calculation or Intrinio for IV
  delta: number; // Note: May require third-party calculation
  percentChange: number;
  expiration: string; // Formatted as YYYY-MM-DD
  underlying: string; // e.g., SPY, SPX
}

interface LiveOptionsChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string; // e.g., SPY, SPX, QQQ
  expiry: string; // YYYY-MM-DD format
  onSelectContract: (contract: LiveOptionContract) => void;
}

// Placeholder for Polygon.io API key (replace with your key or env variable)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY ;
const POLYGON_REST_BASE_URL = 'https://api.polygon.io';
const POLYGON_WS_URL = 'wss://socket.polygon.io/options';

const LiveOptionsChainModal: React.FC<LiveOptionsChainModalProps> = ({
  isOpen,
  onClose,
  symbol,
  expiry,
  onSelectContract,
}) => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<LiveOptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchStrike, setSearchStrike] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    const socket = new WebSocket(POLYGON_WS_URL);

    socket.onopen = () => {
      // Authenticate WebSocket
      socket.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      // Subscribe to options quotes for the symbol and expiry
      socket.send(
        JSON.stringify({
          action: 'subscribe',
          params: `Q.O:${symbol}${expiry.replace(/-/g, '').slice(2)}*`, // e.g., Q.O:SPY250117*
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.ev === 'Q') {
        // Update contracts with real-time quote data
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.epic === data.sym
              ? {
                  ...contract,
                  bid: data.bp || contract.bid,
                  ask: data.ap || contract.ask,
                  volume: data.bv || contract.volume,
                  percentChange: data.lp ? ((data.lp - contract.bid) / contract.bid) * 100 : contract.percentChange,
                }
              : contract
          )
        );
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'WebSocket Error',
        description: 'Failed to connect to live data feed.',
        variant: 'destructive',
      });
    };

    socket.onclose = () => {
      // Attempt to reconnect after 5 seconds
      setTimeout(initializeWebSocket, 5000);
    };

    setWs(socket);
    return () => socket.close();
  }, [symbol, expiry, toast]);

  // Load options chain data via Polygon.io REST API
  const loadOptionsChain = useCallback(async () => {
    if (!symbol || !expiry) return;
    setLoading(true);
    try {
      // Fetch options chain snapshot
      const response = await fetch(
        `${POLYGON_REST_BASE_URL}/v2/snapshot/options/${symbol}?expiration_date=${expiry}&apiKey=${POLYGON_API_KEY}`
      );
      if (!response.ok) throw new Error('Failed to fetch options chain');
      const data = await response.json();

      // Map Polygon.io data to LiveOptionContract
      const enrichedData: LiveOptionContract[] = data.results.map((contract: any) => {
        const isCall = contract.details.contract_type === 'call';
        return {
          epic: contract.details.ticker, // e.g., O:SPY250117C00450000
          strike: contract.details.strike_price,
          type: isCall ? 'Call' : 'Put',
          bid: contract.day.bid || 0,
          ask: contract.day.ask || 0,
          volume: contract.day.volume || 0,
          openInterest: contract.open_interest || 0,
          impliedVolatility: 0, // Placeholder: Polygon.io doesn't provide IV; consider Intrinio or custom calculation
          delta: 0, // Placeholder: Requires external calculation (e.g., Black-Scholes model)
          percentChange: contract.day.change_percent || 0,
          expiration: contract.details.expiration_date,
          underlying: contract.underlying_asset.ticker,
        };
      });

      setContracts(enrichedData);
    } catch (error) {
      console.error('Failed to load options chain:', error);
      toast({
        title: 'Error fetching options chain',
        description: 'Unable to retrieve data from Polygon.io.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [symbol, expiry, toast]);

  // Fetch initial data and initialize WebSocket when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOptionsChain();
      const cleanup = initializeWebSocket();
      return cleanup;
    }
    // Clean up WebSocket on modal close
    return () => ws?.close();
  }, [isOpen, loadOptionsChain, initializeWebSocket, ws]);

  // Filter contracts by strike price
  const filteredContracts = contracts.filter(
    (contract) => !searchStrike || contract.strike.toString().includes(searchStrike)
  );
  const callContracts = filteredContracts.filter((c) => c.type === 'Call');
  const putContracts = filteredContracts.filter((c) => c.type === 'Put');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Options Chain - {symbol}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto">
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
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSelectContract(contract)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">${contract.strike}</span>
                          <Badge variant="outline" className="ml-2">Call</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Bid: ${contract.bid.toFixed(2)} | Ask: ${contract.ask.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Vol: {contract.volume} | OI: {contract.openInterest}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>IV: {(contract.impliedVolatility * 100).toFixed(1)}%</span>
                        <span>Δ: {contract.delta.toFixed(3)}</span>
                        <span className={contract.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {contract.percentChange >= 0 ? '+' : ''}{contract.percentChange.toFixed(2)}%
                        </span>
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
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSelectContract(contract)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">${contract.strike}</span>
                          <Badge variant="outline" className="ml-2">Put</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Bid: ${contract.bid.toFixed(2)} | Ask: ${contract.ask.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Vol: {contract.volume} | OI: {contract.openInterest}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>IV: {(contract.impliedVolatility * 100).toFixed(1)}%</span>
                        <span>Δ: {contract.delta.toFixed(3)}</span>
                        <span className={contract.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {contract.percentChange >= 0 ? '+' : ''}{contract.percentChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveOptionsChainModal;
