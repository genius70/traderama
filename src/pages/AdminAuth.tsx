
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();

  // Allow admin to access dashboard after login
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (!error) {
        // Successful login - redirect will be handled by the Navigate component above
        console.log('Admin login successful');
      }
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const useAdminCredentials = () => {
    setEmail('royan.shaw@gmail.com');
    setPassword('321xbetacashplus');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <TrendingUp className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-red-600">Traderama Admin</h1>
          </div>
          <CardTitle className="text-red-700">Administrator Access</CardTitle>
          <CardDescription>
            Secure admin portal for platform management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Admin Default Credentials Section */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-sm font-semibold mb-3 text-red-700">Admin Access</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start border-red-200 text-red-700 hover:bg-red-100"
              onClick={useAdminCredentials}
            >
              <Shield className="h-4 w-4 mr-2" />
              Use Admin Credentials
            </Button>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Admin Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
