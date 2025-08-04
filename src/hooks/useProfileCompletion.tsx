import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('profile_completion_percentage, role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Skip admin users
        if (profile?.role === 'admin' || profile?.role === 'super_admin') return;

        // If profile is not 100% complete, show toast
        if (profile && (profile.profile_completion_percentage ?? 0) < 100) {
          const completionPercentage = profile.profile_completion_percentage ?? 0;
          
          toast({
            title: `Profile ${completionPercentage}% Complete - KYC Required`,
          });
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      }
    };

    // Check profile completion after a short delay to avoid overwhelming the user
    const timeoutId = setTimeout(checkProfileCompletion, 2000);

    return () => clearTimeout(timeoutId);
  }, [user, toast]);
};