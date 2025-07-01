
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { FeatureTracker } from '@/components/analytics/FeatureTracker';
import UserDashboard from '@/components/dashboard/UserDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin
  const isAdmin = user?.email === 'royan.shaw@gmail.com';
  
  // Check if user has premium subscription (this would come from profiles table in real app)
  const isPremiumUser = false; // This would be fetched from user profile based on subscription_tier

  return (
    <FeatureTracker featureName="dashboard" trackOnUnmount>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto p-4 sm:p-6">
          {/* Conditional Dashboard Rendering */}
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>
    </FeatureTracker>
  );
};

export default Dashboard;
