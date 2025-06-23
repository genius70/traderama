import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await signIn(email, password);
    if (success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if username is available
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      toast({
        title: "Username taken",
        description: "Please choose a different username.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: 'https://qyadjaahgiqkohvucfmg.supabase.co/auth/v1/callback',
      }
    });

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update profile with username after signup
      await supabase
        .from('profiles')
        .update({ username })
        .eq('email', email);
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification.",
      });

      // Redirect to homepage after successful signup
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: 'https://qyadjaahgiqkohvucfmg.supabase.co/auth/v1/callback',
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for reset instructions.",
      });
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://qyadjaahgiqkohvucfmg.supabase.co/auth/v1/callback'
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkGoogleAccount = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.linkIdentity({ provider: 'google' });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Google account linked successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link Google account",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };
const handleUnlinkGoogleAccount = async () => {
  // Check if user is authenticated
  if (!user) {
    toast({
      title: "Error",
      description: "You must be logged in to unlink accounts",
      variant: "destructive",
    });
    return;
  }

  setGoogleLoading(true);
  try {
    // Check for active session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "No active session found",
        variant: "destructive",
      });
      return;
    }

    // retrieve all identities linked to a user
    const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities();
    
    if (!identitiesError) {
      // find the google identity linked to the user
      const googleIdentity = identities.identities.find((identity) => identity.provider === 'google');
      
      if (googleIdentity) {
        // unlink the google identity from the user
        const { data, error } = await supabase.auth.unlinkIdentity(googleIdentity);
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Google account unlinked successfully",
          });
        }
      } else {
        toast({
          title: "Info",
          description: "No Google account linked to unlink",
        });
      }
    } else {
      toast({
        title: "Error",
        description: identitiesError.message,
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to unlink Google account",
      variant: "destructive",
    });
  } finally {
    setGoogleLoading(false);
  }  
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Traderama</h1>
          </div>
          <CardTitle>Welcome to Iron Condor Trading</CardTitle>
          <CardDescription>
            Professional options trading platform for iron condor strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-blue-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowSignupPassword((v) => !v)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-blue-600"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? 'Signing up with Google...' : 'Sign up with Google'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>
            </TabsContent>
             <TabsContent value="oauth">
  <div className="space-y-4">
    {user ? (
      <>
        <div className="text-center text-sm text-gray-600 mb-4">
          Manage your connected accounts
        </div>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={handleLinkGoogleAccount}
          disabled={googleLoading}
        >
          {googleLoading ? 'Linking...' : 'Link Google Account'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={handleUnlinkGoogleAccount}
          disabled={googleLoading}
        >
          {googleLoading ? 'Unlinking...' : 'Unlink Google Account'}
        </Button>
      </>
    ) : (
      <div className="text-center text-sm text-gray-600">
        Please sign in to manage your connected accounts
      </div>
    )}
  </div>
</TabsContent>            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
