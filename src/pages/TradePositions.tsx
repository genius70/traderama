import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IronCondorBuilder from "@/components/trading/IronCondorBuilder";
import TradingOptionsSelector from "@/components/trading/TradingOptionsSelector";
import TradingTemplate from "@/components/trading/TradingTemplate";
import OptionsChainPanel from "@/components/trading/OptionsChainPanel";
import LiveOptionsChainModal from "@/utils/LiveOptionsChainModal";
import { TrendingUp, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// Table components will be implemented inline
// Navigation will be handled with state
import Header from "@/components/layout/Header";
import type { TradingLeg, ContractRow } from "@/components/trading/types";

// Import the live trading functions
import {
  fetchLivePositions,
  submitTradeOrder,
  fetchAccountInfo,
  assessTradeRisk,
  fetchLiveOptionsChain,
  LivePriceWebSocket,
  type LivePosition,
  type TradeOrderRequest,
  type AccountInfo,
  type RiskAssessment
} from "@/utils/liveTradingAPI";

// Risk Assessment Modal
const RiskAssessmentModal = ({ isOpen, onClose, riskData, onConfirm }) => {
  if (!isOpen || !riskData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Risk Assessment
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Max Loss</label>
                <div className="text-lg font-semibold text-red-600">
                  ${Math.abs(riskData.maxLoss).toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Max Gain</label>
                <div className="text-lg font-semibold text-green-600">
                  ${riskData.maxGain.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Risk Level</label>
              <div className={`text-lg font-semibold ${
                riskData.riskLevel === 'High' ? 'text-red-600' :
                riskData.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {riskData.riskLevel}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Margin Requirement</label>
              <div className="text-lg font-semibold">
                ${riskData.marginRequirement.toFixed(2)}
              </div>
            </div>

            {riskData.warnings && riskData.warnings.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Warnings</label>
                <ul className="text-sm text-red-600 mt-1">
                  {riskData.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Proceed with Trade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trade Confirmation Modal
const TradeConfirmationModal = ({ isOpen, onClose, orderResponse }) => {
  if (!isOpen || !orderResponse) return null;

  const isSuccess = orderResponse.status === 'submitted' || orderResponse.status === 'filled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 text-center">
          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}
          
          <h2 className="text-xl font-bold mb-2">
            {isSuccess ? 'Trade Submitted' : 'Trade Failed'}
          </h2>
          
          <p className="text-gray-600 mb-4">{orderResponse.message}</p>
          
          {orderResponse.orderId && (
            <p className="text-sm text-gray-500 mb-4">
              Order ID: {orderResponse.orderId}
            </p>
          )}
          
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple table components
const Table = ({ children, className = "" }) => (
  <table className={`w-full border-collapse ${className}`}>{children}</table>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableHead = ({ children, className = "" }) => (
  <th className={`p-3 text-left font-medium text-gray-700 border-b ${className}`}>{children}</th>
);
const TableRow = ({ children, className = "" }) => (
  <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>
);
const TableCell = ({ children, className = "" }) => (
  <td className={`p-3 ${className}`}>{children}</td>
);

// Updated PositionsTabs with live data and proper null checks
const PositionsTabs = ({ tab, setTab, positions, tradingLogs, accountInfo }) => (
  <Tabs value={tab} onValueChange={setTab} className="mb-8">
    <TabsList className="mb-4 w-full flex flex-wrap">
      <TabsTrigger value="open">Open Positions</TabsTrigger>
      <TabsTrigger value="closed">Closed Positions</TabsTrigger>
      <TabsTrigger value="logs">Trading Logs</TabsTrigger>
      <TabsTrigger value="account">Account</TabsTrigger>
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
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions?.open?.length > 0 ? (
            positions.open.map(pos => (
              <TableRow key={pos.id}>
                <TableCell>{pos.strategy}</TableCell>
                <TableCell>{pos.symbol}</TableCell>
                <TableCell>{pos.contracts}</TableCell>
                <TableCell>${pos.entry?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>${pos.mark?.toFixed(2) || '0.00'}</TableCell>
                <TableCell className={pos.pnl >= 0 ? "text-green-700" : "text-red-600"}>
                  ${pos.pnl?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>{pos.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                No open positions
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TabsContent>
    
    <TabsContent value="closed">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Strategy</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Exit</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Close Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions?.closed?.length > 0 ? (
            positions.closed.map(pos => (
              <TableRow key={pos.id}>
                <TableCell>{pos.strategy}</TableCell>
                <TableCell>{pos.symbol}</TableCell>
                <TableCell>${pos.entry?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>${pos.exit?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell className={pos.pnl >= 0 ? "text-green-700" : "text-red-600"}>
                  ${pos.pnl?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>{pos.closeDate || 'N/A'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No closed positions
              </TableCell>
            </TableRow>
          )}
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
          {tradingLogs?.length > 0 ? (
            tradingLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.time}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                No trading logs available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TabsContent>

    <TabsContent value="account">
      {accountInfo ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Buying Power</div>
              <div className="text-2xl font-bold text-green-600">
                ${accountInfo.buyingPower?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Cash Balance</div>
              <div className="text-2xl font-bold">
                ${accountInfo.cashBalance?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Margin Used</div>
              <div className="text-2xl font-bold text-orange-600">
                ${accountInfo.marginUsed?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Day Trading BP</div>
              <div className="text-2xl font-bold text-blue-600">
                ${accountInfo.dayTradingBuyingPower?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Loading account information...
        </div>
      )}
    </TabsContent>
  </Tabs>
);

// Order Summary component with null checks
const OrderSummary = ({ legs }) => (
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
          {(legs || []).map((leg, i) => (
            <tr key={i}>
              <td className="p-2">{leg.strike || 'N/A'}</td>
              <td className="p-2">{leg.type || 'N/A'}</td>
              <td className="p-2">{leg.expiration || 'N/A'}</td>
              <td className="p-2">{leg.buySell || 'N/A'}</td>
              <td className="p-2">{leg.size || 'N/A'}</td>
              <td className="p-2">{leg.price || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Initial legs for Iron Condor
const initialLegs = [
  { strike: "", type: "Call", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Call", expiration: "", buySell: "Buy", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Sell", size: 1, price: "" },
  { strike: "", type: "Put", expiration: "", buySell: "Buy", size: 1, price: "" },
];

// Main TradePositions component with live integration
const TradePositions = () => {
  const [page, setPage] = useState("strategy");
  const [selectedOption, setSelectedOption] = useState(null);
  const [legs, setLegs] = useState(initialLegs);
  const [tab, setTab] = useState("open");
  // Initialize positions with empty arrays to prevent undefined errors
  const [positions, setPositions] = useState({ open: [], closed: [] });
  // Initialize tradingLogs as empty array
  const [tradingLogs, setTradingLogs] = useState([]);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceSocket, setPriceSocket] = useState(null);
  // Navigation handled with state

  // Load live data on component mount
  useEffect(() => {
    loadLiveData();
    
    // Initialize WebSocket for real-time updates
    const socket = new LivePriceWebSocket();
    socket.connect();
    setPriceSocket(socket);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const loadLiveData = async () => {
    try {
      const [positionsData, accountData] = await Promise.all([
        fetchLivePositions(),
        fetchAccountInfo()
      ]);
      
      // Ensure positions data has the correct structure with fallbacks
      setPositions({
        open: positionsData?.open || [],
        closed: positionsData?.closed || []
      });
      setAccountInfo(accountData);
    } catch (error) {
      console.error('Failed to load live data:', error);
      // Set fallback data on error
      setPositions({ open: [], closed: [] });
      setTradingLogs([]);
    }
  };

  const handleSelectContract = (contract) => {
    setLegs((prevLegs) => {
      const idx = prevLegs.findIndex(
        (leg) =>
          leg.type === contract.type &&
          (!leg.strike || leg.strike === "") &&
          (!leg.expiration || leg.expiration === "")
      );
      if (idx === -1) return prevLegs;
      
      const newLeg = {
        ...prevLegs[idx],
        strike: contract.strike?.toString() || "",
        expiration: contract.expiry || "",
        price: contract.ask?.toString() || "",
      };
      const newLegs = [...prevLegs];
      newLegs[idx] = newLeg;
      return newLegs;
    });
    setIsOptionsModalOpen(false);
  };

  const handleSubmitTrade = async () => {
    setLoading(true);
    
    try {
      // First, assess risk
      const risk = await assessTradeRisk(legs);
      setRiskAssessment(risk);
      setIsRiskModalOpen(true);
    } catch (error) {
      console.error('Risk assessment failed:', error);
      alert('Failed to assess trade risk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmTradeSubmission = async () => {
    setIsRiskModalOpen(false);
    setLoading(true);

    try {
      const orderRequest = {
        symbol: selectedOption?.symbol || "SPY",
        strategy: selectedOption?.name || "Custom Strategy",
        legs: legs,
        orderType: "limit",
        timeInForce: "DAY"
      };

      const response = await submitTradeOrder(orderRequest);
      setOrderResponse(response);
      setIsConfirmModalOpen(true);
      
      // Reload positions after successful trade
      if (response.status === 'submitted' || response.status === 'filled') {
        await loadLiveData();
      }
    } catch (error) {
      console.error('Trade submission failed:', error);
      setOrderResponse({
        status: 'rejected',
        message: 'Trade submission failed. Please try again.',
        orderId: null,
        timestamp: new Date().toISOString()
      });
      setIsConfirmModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-8">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="mb-6 flex items-center">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
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
                Options Trading: {
                  page === "strategy" ? "Select Strategy" : 
                  page === "builder" ? "Configure Trade" : 
                  "Review Submission"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PositionsTabs
                tab={tab}
                setTab={setTab}
                positions={positions}
                tradingLogs={tradingLogs}
                accountInfo={accountInfo}
              />

              {page === "strategy" && (
                <div className="space-y-6">
                  <TradingOptionsSelector
                    onSelectOption={(option) => {
                      setSelectedOption(option);
                      setLegs(option.template?.legs || initialLegs);
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
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setIsOptionsModalOpen(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      Open Live Options Chain
                    </Button>
                  </div>

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
                  <OrderSummary legs={legs} />
                  <div className="flex gap-4 justify-end">
                    <Button variant="secondary" onClick={() => setPage("builder")}>
                      <ArrowLeft className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      onClick={handleSubmitTrade}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Submit Trade'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground text-xs">
            * Live trading integration active. All trades are submitted to your connected broker account.
          </div>
        </div>
      </div>

      {/* Modals */}
      <LiveOptionsChainModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        symbol={selectedOption?.symbol || "SPY"}
        onSelectContract={handleSelectContract}
      />

      <RiskAssessmentModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        riskData={riskAssessment}
        onConfirm={confirmTradeSubmission}
      />

      <TradeConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        orderResponse={orderResponse}
      />
    </div>
  );
};

export default TradePositions;
