import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import UserDashboard from '@/components/dashboard/UserDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremiumStatus();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (authLoading || loading || premiumLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
      case 'super_admin':
        return <AdminDashboard />;
      case 'strategy_creator':
      case 'premium_member':
        return <CreatorDashboard />;
      case 'user':
      default:
        // Check if user is premium and redirect to creator dashboard
        if (isPremium) {
          return <CreatorDashboard />;
        }
        return <UserDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
