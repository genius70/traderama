import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IronCondorBuilder from "@/components/trading/IronCondorBuilder";
import TradingOptionsSelector from "@/components/trading/TradingOptionsSelector";
import TradingTemplate from "@/components/trading/TradingTemplate";
import OptionsChainPanel from "@/components/trading/OptionsChainPanel";
import { TrendingUp, ArrowLeft, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

// Fixing type for TradingLeg so type is "Call" | "Put" and buySell is "Buy" | "Sell"
type TradingLeg = {
  strike: string;
  type: "Call" | "Put";
  expiration: string;
  buySell: "Buy" | "Sell";
  size: number;
  price: string;
};

const initialLegs: TradingLeg[] = [
  { strike: "", type: "Call", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Call", expiration: "", buySell: "Buy", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Buy", size: 1, price: "" },
];

// Mock data for tables
const openPositions = [
  { id: 1, strategy: "Iron Condor", symbol: "SPY", contracts: 1, entry: 2.3, mark: 2.7, pnl: +40, status: "Open" },
];
const closedPositions = [
  { id: 2, strategy: "Bull Call Spread", symbol: "AAPL", contracts: 2, entry: 4.5, exit: 5.1, pnl: +120, status: "Closed" },
];
const tradingLogs = [
  { id: 101, time: "2024-06-13 11:00", action: "Opened Iron Condor", details: "SPY 1 contract" }
];
const pnls = [
  { symbol: "SPY", totalPnl: 120 },
  { symbol: "AAPL", totalPnl: 80 },
];

const TradePositions: React.FC = () => {
  const [page, setPage] = useState<"strategy" | "builder" | "confirmation">("strategy");
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [legs, setLegs] = useState<TradingLeg[]>(initialLegs);
  const [tab, setTab] = useState("open");
  const navigate = useNavigate();

  const handleSelectContract = (contract: any) => {
    console.log('Select button clicked with contract:', contract);
    setLegs((prevLegs) => {
      // Find first incomplete leg (matching type and empty strike)
      const idx = prevLegs.findIndex(
        (leg) =>
          leg.type === contract.type &&
          (!leg.strike || leg.strike === "") &&
          (!leg.expiration || leg.expiration === "")
      );
      if (idx === -1) {
        console.log("No empty slot for this contract type in legs:", contract.type);
        return prevLegs;
      }
      // Autofill strike, expiration (from expiry), and price from contract
      const newLeg = {
        ...prevLegs[idx],
        strike: contract.strike || "",
        expiration: contract.expiry || "", // Fix: map contract.expiry => leg.expiration
        price: contract.ask?.toString?.() || "",
      };
      const newLegs = [...prevLegs];
      newLegs[idx] = newLeg;
      console.log("Legs after update:", newLegs);
      return newLegs;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2 ml-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Trade Positions
          </h1>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Options Trading: {page === "strategy" ? "Select Strategy" : page === "builder" ? "Configure Trade" : "Review Submission"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="mb-8">
              <TabsList className="mb-4 w-full flex flex-wrap">
                <TabsTrigger value="open">Open Positions</TabsTrigger>
                <TabsTrigger value="closed">Closed Positions</TabsTrigger>
                <TabsTrigger value="logs">Trading Logs</TabsTrigger>
                <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
              </TabsList>
              <TabsContent value="open">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Mark</TableHead>
                      <TableHead>P&amp;L</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openPositions.map(pos => (
                      <TableRow key={pos.id}>
                        <TableCell>{pos.strategy}</TableCell>
                        <TableCell>{pos.symbol}</TableCell>
                        <TableCell>{pos.contracts}</TableCell>
                        <TableCell>{pos.entry}</TableCell>
                        <TableCell>{pos.mark}</TableCell>
                        <TableCell className={pos.pnl >= 0 ? "text-green-700" : "text-red-600"}>{pos.pnl}</TableCell>
                        <TableCell>{pos.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="closed">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Contracts</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>P&amp;L</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedPositions.map(pos => (
                      <TableRow key={pos.id}>
                        <TableCell>{pos.strategy}</TableCell>
                        <TableCell>{pos.symbol}</TableCell>
                        <TableCell>{pos.contracts}</TableCell>
                        <TableCell>{pos.entry}</TableCell>
                        <TableCell>{pos.exit}</TableCell>
                        <TableCell className={pos.pnl >= 0 ? "text-green-700" : "text-red-600"}>{pos.pnl}</TableCell>
                        <TableCell>{pos.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="logs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradingLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.time}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="pnl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Total P&amp;L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pnls.map((pnl, i) => (
                      <TableRow key={i}>
                        <TableCell>{pnl.symbol}</TableCell>
                        <TableCell className={pnl.totalPnl >= 0 ? "text-green-700" : "text-red-600"}>{pnl.totalPnl}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
            {page === "strategy" && (
              <div className="space-y-6">
                <TradingOptionsSelector
                  onSelectOption={(option) => {
                    setSelectedOption(option);
                    setLegs(option.template.legs);
                    setPage("builder");
                  }}
                />
              </div>
            )}
            {page === "builder" && (
              <div className="space-y-6">
                <TradingTemplate
                  strategyName={selectedOption?.name || "Strategy"}
                  legs={legs}
                  onLegsChange={setLegs}
                />
                <OptionsChainPanel
                  symbol={selectedOption?.symbol || "SPY"}
                  onSelectContract={handleSelectContract}
                />
                <div className="flex gap-4 mt-4 justify-end">
                  <Button variant="secondary" onClick={() => setPage("strategy")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => setPage("confirmation")}>
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
            {page === "confirmation" && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          <th className="p-2">Strike</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Expiration</th>
                          <th className="p-2">B/S</th>
                          <th className="p-2">Size</th>
                          <th className="p-2">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {legs.map((leg, i) => (
                          <tr key={i}>
                            <td className="p-2">{leg.strike}</td>
                            <td className="p-2">{leg.type}</td>
                            <td className="p-2">{leg.expiration}</td>
                            <td className="p-2">{leg.buySell}</td>
                            <td className="p-2">{leg.size}</td>
                            <td className="p-2">{leg.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <Button variant="secondary" onClick={() => setPage("builder")}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-colors" onClick={() => alert("Trade submitted! (Live trading backend integration needed)")}>
                    Submit Trade
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="text-center text-muted-foreground text-xs">
          * This platform supports multi-leg options strategies, including Iron Condors, Spreads, Straddles, and more. For live trading, connect your broker account in settings.
        </div>
      </div>
    </div>
  );
};

export default TradePositions;
