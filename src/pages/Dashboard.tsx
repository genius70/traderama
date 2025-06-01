
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import TradingChart from '@/components/trading/TradingChart';
import IronCondorBuilder from '@/components/trading/IronCondorBuilder';
import StrategyMarketplace from '@/components/strategies/StrategyMarketplace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-6">
        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TradingChart symbol="SPY" />
              </div>
              <div>
                <IronCondorBuilder />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <StrategyMarketplace />
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="text-center p-8 text-gray-500">
              Portfolio management coming soon...
            </div>
          </TabsContent>

          <TabsContent value="brokers">
            <div className="text-center p-8 text-gray-500">
              Broker connections coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
