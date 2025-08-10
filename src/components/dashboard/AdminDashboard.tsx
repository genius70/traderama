import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserAnalyticsPanel from '@/components/admin/UserAnalyticsPanel';
import AdminAirdropPanel from '@/components/gamification/AdminAirdropPanel';
import StrategyApproval from '@/components/admin/StrategyApproval';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1>Admin Dashboard</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Admin Dashboard
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium">
                Total Revenue:
              </span>
              <span className="ml-auto text-sm text-green-500">
                $5,450
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">
                Active Subscriptions:
              </span>
              <span className="ml-auto text-sm text-blue-500">
                32
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserAnalyticsPanel />
        <AdminAirdropPanel />
        <StrategyApproval />
      </div>
    </div>
  );
};

export default AdminDashboard;
