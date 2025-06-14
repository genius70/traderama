
import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ContractRow {
  strike: string;
  type: "Call" | "Put";
  expiry: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  iv: number; // implied volatility
  pmp: number; // probability of max profit (mocked)
  pop: number; // probability of profit (mocked)
}

interface OptionsChainPanelProps {
  symbol: string;
  onSelectContract?: (contract: ContractRow) => void;
}

const mockExpiries = [
  "2025-06-21",
  "2025-06-28",
  "2025-07-05",
];

function generateMockChain(expiry: string, type: "Call" | "Put" = "Call"): ContractRow[] {
  // Generate 7 strikes for illustration, centered at 520 (simulate SPY)
  return Array.from({ length: 7 }, (_, i) => {
    const base = 520;
    const strike = (base - 15 + i * 5);
    return {
      strike: strike.toString(),
      type,
      expiry,
      bid: +(Math.random() * 4 + 1).toFixed(2),
      ask: +(Math.random() * 4 + 1.5).toFixed(2),
      volume: Math.floor(Math.random() * 3000),
      openInterest: Math.floor(Math.random() * 5000),
      iv: +(Math.random() * 0.12 + 0.14).toFixed(2),
      pmp: +(Math.random() * 0.2 + 0.7).toFixed(2),
      pop: +(Math.random() * 0.5 + 0.3).toFixed(2),
    };
  });
}

const OptionsChainPanel: React.FC<OptionsChainPanelProps> = ({
  symbol,
  onSelectContract,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>(mockExpiries[0]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const autoRefreshTimeout = useRef<number>();

  // Load TradingView widget on mount or symbol change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `OANDA:${symbol}USD`,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: "tradingview_options_chain_chart",
      });
      chartRef.current.appendChild(script);
    }
  }, [symbol]);

  // Auto-refresh options data every 20 seconds
  const refreshOptionsData = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      // Both calls and puts, combine and sort by strike ascending
      const mockCalls = generateMockChain(selectedExpiry, "Call");
      const mockPuts = generateMockChain(selectedExpiry, "Put");
      setContracts(
        [...mockCalls, ...mockPuts].sort((a, b) => +a.strike - +b.strike)
      );
      setLoading(false);
    }, 700); // Simulate network delay
  }, [selectedExpiry]);

  useEffect(() => {
    refreshOptionsData();
    autoRefreshTimeout.current && clearTimeout(autoRefreshTimeout.current);
    autoRefreshTimeout.current = window.setTimeout(refreshOptionsData, 20000);
    return () => {
      autoRefreshTimeout.current && clearTimeout(autoRefreshTimeout.current);
    };
  }, [refreshOptionsData]);

  // Refetch when expiry changes
  useEffect(() => {
    refreshOptionsData();
    // Handling timeout restart
    autoRefreshTimeout.current && clearTimeout(autoRefreshTimeout.current);
    autoRefreshTimeout.current = window.setTimeout(refreshOptionsData, 20000);
    return () => {
      autoRefreshTimeout.current && clearTimeout(autoRefreshTimeout.current);
    };
  }, [selectedExpiry, refreshOptionsData]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>
          Live Options Chain <span className="text-blue-600 font-semibold">{symbol}</span>{" "}
          <span className="ml-2 bg-blue-100 rounded px-2 py-1 text-xs font-mono text-blue-700">IG/TradingView</span>
        </CardTitle>
        <div className="flex items-center gap-4 mt-2">
          Expiry:
          <div className="flex gap-2">
            {mockExpiries.map((expiry) => (
              <Button
                key={expiry}
                size="sm"
                variant={selectedExpiry === expiry ? "default" : "outline"}
                className="text-xs px-3 py-1"
                onClick={() => setSelectedExpiry(expiry)}
              >
                {expiry}
              </Button>
            ))}
          </div>
          <span className="text-muted-foreground ml-auto text-xs">
            (Auto-refreshes every 20s)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 border rounded">
          <div ref={chartRef} id="tradingview_options_chain_chart" className="w-full h-[320px]" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Bid</TableHead>
              <TableHead>Ask</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Open Int</TableHead>
              <TableHead>IV</TableHead>
              <TableHead>PMP</TableHead>
              <TableHead>POP</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-5">Loading live contracts...</TableCell>
              </TableRow>
            ) : (
              contracts.map((c, idx) => (
                <TableRow key={idx} className={c.type === "Call" ? "bg-blue-50" : "bg-pink-50"}>
                  <TableCell className="font-medium">{c.type}</TableCell>
                  <TableCell>{c.strike}</TableCell>
                  <TableCell>${c.bid.toFixed(2)}</TableCell>
                  <TableCell>${c.ask.toFixed(2)}</TableCell>
                  <TableCell>{c.volume}</TableCell>
                  <TableCell>{c.openInterest}</TableCell>
                  <TableCell>{(c.iv * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(c.pmp * 100).toFixed(0)}%</TableCell>
                  <TableCell>{(c.pop * 100).toFixed(0)}%</TableCell>
                  <TableCell>{c.expiry}</TableCell>
                  <TableCell>
                    {onSelectContract && (
                      <Button size="sm" variant="ghost" onClick={() => onSelectContract(c)}>
                        Select
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OptionsChainPanel;
