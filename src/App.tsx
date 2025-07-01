
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import CreateStrategy from "./pages/CreateStrategy";
import AutoTrading from "./pages/AutoTrading";
import MarketTrends from "./pages/MarketTrends";
import AdminAnalytics from "./pages/AdminAnalytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import AirdropPage from "./pages/AirdropPage";
import ProductOffers from "./pages/ProductOffers";
import TradePositions from "./pages/TradePositions";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";

// Create QueryClient instance with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AnalyticsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/create-strategy" element={<CreateStrategy />} />
                <Route path="/auto-trading" element={<AutoTrading />} />
                <Route path="/market-trends" element={<MarketTrends />} />              
                <Route path="/admin" element={<AdminAnalytics />} />
                <Route path="/profile/:userId?" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/community" element={<Community />} />
                <Route path="/airdrop" element={<AirdropPage />} />
                <Route path="/product-offers" element={<ProductOffers />} />
                <Route path="/trade-positions" element={<TradePositions />} />
                <Route path="/success" element={<PaymentSuccess />} />
                <Route path="/cancel" element={<PaymentCancel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AnalyticsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
