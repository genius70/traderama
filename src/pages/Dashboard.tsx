import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserDashboard from '@/components/dashboard/UserDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
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
          .select('role')
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

  if (authLoading || loading) {
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
        return <CreatorDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Header />  
  </div>  
     <div className="space-y-6">
      {renderDashboard()}
    </div>
    
  );
};

export default Dashboard;
