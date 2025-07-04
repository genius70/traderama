
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const usePremiumStatus = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('premium_subscriptions')
          .select('tier, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking premium status:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setIsPremium(true);
          setSubscriptionTier(data.tier);
          setExpiresAt(data.expires_at);
        } else {
          setIsPremium(false);
          setSubscriptionTier(null);
          setExpiresAt(null);
        }
      } catch (error) {
        console.error('Error in checkPremiumStatus:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  return { isPremium, subscriptionTier, expiresAt, loading };
};
