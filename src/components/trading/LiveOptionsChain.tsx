import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchOptionsChain, fetchOptionsChainMetadata } from '@/utils/polygonAPI';
import { authenticateIG, IGAuthTokens } from '@/utils/igTradingAPI';
import { format, addWeeks, isFriday, nextFriday } from 'date-fns';

interface Contract {
  epic: string;
  underlying: string;
  expiration: string;
  strike: number;
  type: 'Call' | 'Put';
  bid: number;
  ask: number;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    impliedVolatility: number;
  };
}

interface LiveOptionsChainProps {
  expiration: string; // Controlled by CreateStrategy
  onSelectContract: (contract: {
    strike: number;
    type: 'Call' | 'Put';
    bid: number;
    ask: number;
    underlying: string;
    epic: string;
    greeks: {
      delta: number;
      gamma: number;
      theta: number;
      vega: number;
      impliedVolatility: number;
    };
  }) => void;
}

const POLYGON_WS_URL = 'wss://socket.polygon.io/options';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

const LiveOptionsChain: React.FC<LiveOptionsChainProps> = ({ expiration, onSelectContract }) => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [underlying, setUnderlying] = useState<string>('SPY'); // Default to SPY
  const [availableUnderlyings, setAvailableUnderlyings] = useState<string[]>(['SPY', 'QQQ', 'IWM', 'GLD', 'SLV']);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [authTokens, setAuthTokens] = useState<IGAuthTokens | null>(null);

  // Authenticate with IG API on mount
  useEffect(() => {
    const authenticate = async () => {
      try {
        const tokens = await authenticateIG();
        setAuthTokens(tokens);
      } catch (err) {
        toast({
          title: 'Authentication Error',
          variant: 'destructive',
        });
      }
    };
    authenticate();
  }, [toast]);

  // Fetch available underlyings on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { underlyings } = await fetchOptionsChainMetadata();
        setAvailableUnderlyings(underlyings.length > 0 ? underlyings : ['SPY', 'QQQ', 'IWM', 'GLD', 'SLV']);
        if (underlyings.length > 0 && !underlyings.includes(underlying)) {
          setUnderlying(underlyings[0]);
        }
      } catch (err) {
        toast({
          title: 'Error fetching metadata',
          variant: 'destructive',
        });
      }
    };
    fetchMetadata();
  }, [toast, underlying]);

  // Initialize WebSocket connection for Polygon.io
  const initializeWebSocket = useCallback(() => {
    if (!underlying || !expiration) return;
    const socket = new WebSocket(POLYGON_WS_URL);

    socket.onopen = () => {
      socket.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      socket.send(
        JSON.stringify({
          action: 'subscribe',
          params: `Q.O:${underlying}${expiration.replace(/-/g, '').slice(2)}*`,
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.ev === 'Q') {
        setContracts((prevContracts) =>
          prevContracts.map((contract) =>
            contract.epic === data.sym
              ? {
                  ...contract,
                  bid: data.bp || contract.bid,
                  ask: data.ap || contract.ask,
                  greeks: {
                    ...contract.greeks,
                    delta: data.delta || contract.greeks.delta,
                    gamma: data.gamma || contract.greeks.gamma,
                    theta: data.theta || contract.greeks.theta,
                    vega: data.vega || contract.greeks.vega,
                    impliedVolatility: data.iv || contract.greeks.impliedVolatility,
                  },
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
        variant: 'destructive',
      });
    };

    socket.onclose = () => {
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
        const mappedContracts: Contract[] = data.map((contract: any) => ({
          epic: contract.epic || `LIVE_${contract.strike}_${contract.type}`,
          underlying: contract.underlying || underlying,
          expiration: contract.expiration || expiration,
          strike: contract.strike,
          type: contract.type as 'Call' | 'Put',
          bid: contract.bid || 0,
          ask: contract.ask || 0,
          greeks: {
            delta: contract.delta || 0,
            gamma: contract.gamma || 0,
            theta: contract.theta || 0,
            vega: contract.vega || 0,
            impliedVolatility: contract.impliedVolatility || 0,
          },
        }));
        setContracts(mappedContracts);
      } catch (err) {
        setError('Failed to load options chain');
        toast({
          title: 'Error fetching options chain',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const cleanup = initializeWebSocket();
    return cleanup;
  }, [underlying, expiration, initializeWebSocket, toast]);

  // Handle contract selection
  const handleSelectContract = (contract: Contract) => {
    onSelectContract({
      strike: contract.strike,
      type: contract.type,
      bid: contract.bid,
      ask: contract.ask,
      underlying: contract.underlying,
      epic: contract.epic,
      greeks: contract.greeks,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options Chain</CardTitle>
        <CardDescription>Select an options contract to add to your strategy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>No contracts available for the selected criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Ask</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>Gamma</TableHead>
                  <TableHead>Theta</TableHead>
                  <TableHead>Vega</TableHead>
                  <TableHead>IV</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={`${contract.epic}-${contract.strike}-${contract.type}`}>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>{contract.strike}</TableCell>
                    <TableCell>{contract.bid.toFixed(2)}</TableCell>
                    <TableCell>{contract.ask.toFixed(2)}</TableCell>
                    <TableCell>{contract.greeks.delta.toFixed(3)}</TableCell>
                    <TableCell>{contract.greeks.gamma.toFixed(3)}</TableCell>
                    <TableCell>{contract.greeks.theta.toFixed(3)}</TableCell>
                    <TableCell>{contract.greeks.vega.toFixed(3)}</TableCell>
                    <TableCell>{contract.greeks.impliedVolatility.toFixed(2)}%</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleSelectContract(contract)}>
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOptionsChain;
