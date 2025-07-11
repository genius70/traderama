// src/components/trading/LiveOptionsChain.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { fetchOptionsChain } from '@/utils/igTradingAPI';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  strike: number;
  type: 'Call' | 'Put';
  ask: number;
  bid: number;
  expiration: string;
  underlying: string;
}

interface LiveOptionsChainProps {
  onSelectContract: (contract: { strike: number; type: 'Call' | 'Put'; ask: number }) => void;
}

const LiveOptionsChain: React.FC<LiveOptionsChainProps> = ({ onSelectContract }) => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [underlying, setUnderlying] = useState<string>(''); // e.g., 'SPY'
  const [expiration, setExpiration] = useState<string>(''); // e.g., '2025-08-15'
  const [availableUnderlyings, setAvailableUnderlyings] = useState<string[]>([]);
  const [availableExpirations, setAvailableExpirations] = useState<string[]>([]);

  // Fetch available underlyings and expirations on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { underlyings, expirations } = await fetchOptionsChainMetadata();
        setAvailableUnderlyings(underlyings);
        setAvailableExpirations(expirations);
        if (underlyings.length > 0) setUnderlying(underlyings[0]);
        if (expirations.length > 0) setExpiration(expirations[0]);
      } catch (err) {
        toast({
          title: 'Error fetching metadata',
          description: 'Unable to load underlyings or expirations.',
          variant: 'destructive',
        });
      }
    };
    fetchMetadata();
  }, []);

  // Fetch options chain when underlying or expiration changes
  useEffect(() => {
    if (!underlying || !expiration) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOptionsChain({ underlying, expiration });
        setContracts(data);
      } catch (err) {
        setError('Failed to load options chain');
        toast({
          title: 'Error fetching options chain',
          description: 'Unable to retrieve data from the broker.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [underlying, expiration, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options Chain</CardTitle>
        <CardDescription>Select an options contract to add to your strategy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters for underlying and expiration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Underlying Asset</label>
              <Select value={underlying} onValueChange={setUnderlying}>
                <SelectTrigger>
                  <SelectValue placeholder="Select underlying" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnderlyings.map((asset) => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Expiration Date</label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {availableExpirations.map((exp) => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options Chain Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No contracts available for the selected criteria.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-2 border rounded">
                  <span>
                    {contract.underlying} {contract.type} Strike: {contract.strike}, Ask: {contract.ask.toFixed(2)}, Expires: {contract.expiration}
                  </span>
                  <Button
                    onClick={() => onSelectContract({
                      strike: contract.strike,
                      type: contract.type,
                      ask: contract.ask,
                    })}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOptionsChain;
