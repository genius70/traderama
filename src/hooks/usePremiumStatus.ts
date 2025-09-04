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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_premium, subscription_tier, subscription_expires_at')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching premium status:', error);
          setIsPremium(false);
          setSubscriptionTier('free');
          setExpiresAt(null);
        } else {
          setIsPremium(profile?.is_premium || false);
          setSubscriptionTier(profile?.subscription_tier || 'free');
          setExpiresAt(profile?.subscription_expires_at || null);
        }
      } catch (error) {
        console.error('Error in checkPremiumStatus:', error);
        setIsPremium(false);
        setSubscriptionTier('free');
        setExpiresAt(null);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  return { isPremium, subscriptionTier, expiresAt, loading };
};