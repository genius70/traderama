import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface MockContract {
  type: 'Call' | 'Put';
  strike: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  iv: number;
  expiry: string;
}

interface MockOptionsChainProps {
  onSelectContract?: (contract: MockContract) => void;
}

const MockOptionsChain: React.FC<MockOptionsChainProps> = ({ onSelectContract }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [selectedExpiry, setSelectedExpiry] = useState('2024-02-16');

  const symbols = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA'];
  const expiries = ['2024-02-16', '2024-02-23', '2024-03-01', '2024-03-15'];

  // Mock data generation
  const generateMockContracts = (): MockContract[] => {
    const contracts: MockContract[] = [];
    const basePrice = selectedSymbol === 'SPY' ? 485 : selectedSymbol === 'QQQ' ? 400 : 180;
    
    for (let i = -5; i <= 5; i++) {
      const strike = basePrice + (i * 5);
      
      // Call contract
      contracts.push({
        type: 'Call',
        strike,
        bid: Math.max(0.05, (basePrice - strike + 10) * 0.1 + Math.random() * 2),
        ask: Math.max(0.10, (basePrice - strike + 10) * 0.1 + Math.random() * 2 + 0.05),
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        iv: 0.15 + Math.random() * 0.3,
        expiry: selectedExpiry
      });

      // Put contract
      contracts.push({
        type: 'Put',
        strike,
        bid: Math.max(0.05, (strike - basePrice + 10) * 0.1 + Math.random() * 2),
        ask: Math.max(0.10, (strike - basePrice + 10) * 0.1 + Math.random() * 2 + 0.05),
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        iv: 0.15 + Math.random() * 0.3,
        expiry: selectedExpiry
      });
    }

    return contracts.sort((a, b) => a.strike - b.strike);
  };

  const contracts = generateMockContracts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options Chain</CardTitle>
        <div className="flex space-x-4">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {symbols.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expiries.map((expiry) => (
                <SelectItem key={expiry} value={expiry}>{expiry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Bid</TableHead>
                <TableHead>Ask</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>OI</TableHead>
                <TableHead>IV</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract, idx) => (
                <TableRow 
                  key={idx} 
                  className={contract.type === 'Call' ? 'bg-blue-50/50' : 'bg-red-50/50'}
                >
                  <TableCell className="font-medium">{contract.type}</TableCell>
                  <TableCell>{contract.strike}</TableCell>
                  <TableCell>${contract.bid.toFixed(2)}</TableCell>
                  <TableCell>${contract.ask.toFixed(2)}</TableCell>
                  <TableCell>{contract.volume}</TableCell>
                  <TableCell>{contract.openInterest}</TableCell>
                  <TableCell>{(contract.iv * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    {onSelectContract && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onSelectContract(contract)}
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MockOptionsChain;