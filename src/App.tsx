
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import ErrorBoundary from "@/components/analytics/ErrorBoundary";

// Lazy load components to reduce initial bundle size
const Index = React.lazy(() => import("./pages/Index"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Auth = React.lazy(() => import("./pages/Auth"));
const AdminAuth = React.lazy(() => import("./pages/AdminAuth"));
const CreateStrategy = React.lazy(() => import("./pages/CreateStrategy"));
const AutoTrading = React.lazy(() => import("./pages/AutoTrading"));
const MarketTrends = React.lazy(() => import("./pages/MarketTrends"));
const AdminAnalytics = React.lazy(() => import("./pages/AdminAnalytics"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Community = React.lazy(() => import("./pages/Community"));
const AirdropPage = React.lazy(() => import("./pages/AirdropPage"));
const ProductOffers = React.lazy(() => import("./pages/ProductOffers"));
const TradePositions = React.lazy(() => import("./pages/TradePositions"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = React.lazy(() => import("./pages/PaymentCancel"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Enhanced loading component with better visual feedback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading Traderama...</p>
    </div>
  </div>
);

// Create QueryClient instance with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AnalyticsProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              </BrowserRouter>
            </AnalyticsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
