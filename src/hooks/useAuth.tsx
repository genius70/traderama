
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { 
  AUTH_ERRORS, 
  AUTH_STATES, 
  type AuthError,
  type AuthState
} from '@/constants';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AuthState>(AUTH_STATES.IDLE);
  const [error, setError] = useState<AuthError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(AUTH_ERRORS.UNKNOWN_ERROR);
          setState(AUTH_STATES.ERROR);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setState(session ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.UNAUTHENTICATED);
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError(AUTH_ERRORS.UNKNOWN_ERROR);
        setState(AUTH_STATES.ERROR);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
        
        switch (event) {
          case 'SIGNED_IN':
            setState(AUTH_STATES.AUTHENTICATED);
            toast({ title: 'Welcome back!' });
            break;
          case 'SIGNED_OUT':
            setState(AUTH_STATES.UNAUTHENTICATED);
            toast({ title: 'Signed out successfully' });
            break;
          case 'TOKEN_REFRESHED':
            setState(AUTH_STATES.AUTHENTICATED);
            break;
          case 'USER_UPDATED':
            setState(AUTH_STATES.AUTHENTICATED);
            break;
          default:
            setState(AUTH_STATES.UNAUTHENTICATED);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setState(AUTH_STATES.LOADING);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError(AUTH_ERRORS.INVALID_CREDENTIALS);
          toast({
            title: 'Sign in failed',
            description: AUTH_ERRORS.INVALID_CREDENTIALS,
            variant: 'destructive',
          });
        } else {
          setError(AUTH_ERRORS.UNKNOWN_ERROR);
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        }
        setState(AUTH_STATES.ERROR);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(AUTH_ERRORS.NETWORK_ERROR);
      setState(AUTH_STATES.ERROR);
      toast({
        title: 'Sign in failed',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setState(AUTH_STATES.LOADING);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(AUTH_ERRORS.UNKNOWN_ERROR);
        setState(AUTH_STATES.ERROR);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign up successful',
          description: 'Please check your email to confirm your account',
        });
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(AUTH_ERRORS.NETWORK_ERROR);
      setState(AUTH_STATES.ERROR);
      toast({
        title: 'Sign up failed',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setState(AUTH_STATES.LOADING);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(AUTH_ERRORS.UNKNOWN_ERROR);
        setState(AUTH_STATES.ERROR);
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError(AUTH_ERRORS.NETWORK_ERROR);
      setState(AUTH_STATES.ERROR);
      toast({
        title: 'Sign out failed',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setState(AUTH_STATES.LOADING);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        setError(AUTH_ERRORS.UNKNOWN_ERROR);
        setState(AUTH_STATES.ERROR);
        toast({
          title: 'Password reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password reset sent',
          description: 'Please check your email for reset instructions',
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(AUTH_ERRORS.NETWORK_ERROR);
      setState(AUTH_STATES.ERROR);
      toast({
        title: 'Password reset failed',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      setState(AUTH_STATES.LOADING);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(AUTH_ERRORS.UNKNOWN_ERROR);
        setState(AUTH_STATES.ERROR);
        toast({
          title: 'Password update failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully updated',
        });
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError(AUTH_ERRORS.NETWORK_ERROR);
      setState(AUTH_STATES.ERROR);
      toast({
        title: 'Password update failed',
        description: AUTH_ERRORS.NETWORK_ERROR,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    state,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook from auth-context
export { useAuth } from './auth-context';

export default AuthProvider;
