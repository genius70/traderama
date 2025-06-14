
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IronCondorBuilder from "@/components/trading/IronCondorBuilder";
import TradingOptionsSelector from "@/components/trading/TradingOptionsSelector";
import TradingTemplate from "@/components/trading/TradingTemplate";
import { TrendingUp, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialLegs = [
  { strike: "", type: "Call", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Call", expiration: "", buySell: "Buy", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Buy", size: 1, price: "" },
];

const TradePositions: React.FC = () => {
  const [page, setPage] = useState<"strategy" | "builder" | "confirmation">("strategy");
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [legs, setLegs] = useState(initialLegs);
  const navigate = useNavigate();

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
