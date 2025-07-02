
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';

interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  userGrowthRate: number;
}

const UserAnalyticsPanel = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
    userGrowthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all users with their creation dates
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at, email, name');
      
      if (usersError) throw usersError;

      // Calculate date ranges
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      // Calculate metrics
      const totalUsers = users?.length || 0;
      const newUsersThisMonth = users?.filter(user => 
        new Date(user.created_at) >= thisMonth
      ).length || 0;
      
      const newUsersLastMonth = users?.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate >= lastMonth && userDate < thisMonth;
      }).length || 0;

      // Calculate growth rate
      const userGrowthRate = newUsersLastMonth > 0 
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
        : newUsersThisMonth > 0 ? 100 : 0;

      // For now, assume all users are active (can be enhanced with session data)
      const activeUsers = totalUsers;

      setStats({
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        userGrowthRate
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Error loading user stats",
        description: "Failed to load user analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          User Analytics
        </CardTitle>
        <CardDescription>Live user statistics and growth metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">New This Month</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.newUsersThisMonth.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeUsers.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Growth Rate</span>
            </div>
            <div className={`text-2xl font-bold ${stats.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.userGrowthRate >= 0 ? '+' : ''}{stats.userGrowthRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAnalyticsPanel;
