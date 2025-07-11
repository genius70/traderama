// src/utils/LiveOptionsChainModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { fetchOptionsChain, IGAuthTokens } from '@/utils/igTradingAPI';
import { useToast } from '@/hooks/use-toast';

interface LiveOptionContract {
  epic: string;
  strike: number;
  type: 'Call' | 'Put';
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  percentChange: number;
  expiration: string;
  underlying: string;
}

interface LiveOptionsChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  expiry: string; // Added to pass selectedExpiry
  onSelectContract: (contract: LiveOptionContract) => void;
}

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
  const [authTokens, setAuthTokens] = useState<IGAuthTokens | null>(null);

  // Authenticate with IG API on mount
  useEffect(() => {
    const authenticate = async () => {
      try {
        const tokens = await supabase.functions.invoke('get-auth-tokens', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.id}` },
        });
        setAuthTokens(tokens);
      } catch (err) {
        toast({
          title: 'Authentication Error',
          description: 'Unable to authenticate with the broker.',
          variant: 'destructive',
        });
      }
    };
    if (isOpen) authenticate();
  }, [isOpen, toast]);

  // Load options chain data
  const loadOptionsChain = useCallback(async () => {
    if (!authTokens || !symbol || !expiry) return;
    setLoading(true);
    try {
      const data = await fetchOptionsChain({ auth: authTokens, underlying: symbol, expiration: expiry });
      // Map IG API data to LiveOptionContract, adding mock Greeks for now
      const enrichedData = data.map((contract) => ({
        ...contract,
        volume: Math.floor(Math.random() * 1000), // Mock volume
        openInterest: Math.floor(Math.random() * 500), // Mock open interest
        impliedVolatility: Math.random() * 0.5, // Mock IV
        delta: Math.random() * (contract.type === 'Call' ? 1 : -1), // Mock delta
        percentChange: (Math.random() - 0.5) * 10, // Mock percent change
      }));
      setContracts(enrichedData);
    } catch (error) {
      console.error('Failed to load options chain:', error);
      toast({
        title: 'Error fetching options chain',
        description: 'Unable to retrieve data from the broker.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [authTokens, symbol, expiry, toast]);

  useEffect(() => {
    if (isOpen && authTokens) {
      loadOptionsChain();
    }
  }, [isOpen, authTokens, loadOptionsChain]);

  const filteredContracts = contracts.filter((contract) =>
    !searchStrike || contract.strike.toString().includes(searchStrike)
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
