import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOptionsChain, fetchOptionsChainMetadata } from '@/utils/polygonAPI';

interface Contract {
  id: string; // Maps to Polygon.io's contract ticker (e.g., O:SPY250117C00450000)
  strike: number;
  type: 'Call' | 'Put';
  ask: number;
  bid: number;
  expiration: string; // YYYY-MM-DD
  underlying: string; // e.g., SPY, SPX
}

interface LiveOptionsChainProps {
  onSelectContract: (contract: { strike: number; type: 'Call' | 'Put'; ask: number }) => void;
}

const POLYGON_WS_URL = 'wss://socket.polygon.io/options';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY ;

const LiveOptionsChain: React.FC<LiveOptionsChainProps> = ({ onSelectContract }) => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [underlying, setUnderlying] = useState<string>('');
  const [expiration, setExpiration] = useState<string>('');
  const [availableUnderlyings, setAvailableUnderlyings] = useState<string[]>([]);
  const [availableExpirations, setAvailableExpirations] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

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
  }, [toast]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!underlying || !expiration) return;
    const socket = new WebSocket(POLYGON_WS_URL);

    socket.onopen = () => {
      // Authenticate WebSocket
      socket.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      // Subscribe to options quotes for the underlying and expiration
      socket.send(
        JSON.stringify({
          action: 'subscribe',
          params: `Q.O:${underlying}${expiration.replace(/-/g, '').slice(2)}*`, // e.g., Q.O:SPY250117*
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.ev === 'Q') {
        // Update contracts with real-time quote data
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.id === data.sym
              ? {
                  ...contract,
                  bid: data.bp || contract.bid,
                  ask: data.ap || contract.ask,
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
  }, [underlying, expiration, toast]);

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
          description: 'Unable to retrieve data from Polygon.io.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const cleanup = initializeWebSocket();
    return cleanup;
  }, [underlying, expiration, toast, initializeWebSocket]);

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
