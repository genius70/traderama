
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { FeatureTracker } from '@/components/analytics/FeatureTracker';
import UserDashboard from '@/components/dashboard/UserDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is admin (specifically royan.shaw@gmail.com)
  const isAdmin = user?.email === 'royan.shaw@gmail.com';

  return (
    <FeatureTracker featureName="dashboard" trackOnUnmount>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto p-4 sm:p-6">
          {/* Conditional Dashboard Rendering - Show only one at a time */}
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
