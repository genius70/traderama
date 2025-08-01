import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

      // Temporarily disable premium subscription check until table is created
      // Premium features will default to free tier
      setIsPremium(false);
      setSubscriptionTier('free');
      setExpiresAt(null);
      setLoading(false);
    };

    checkPremiumStatus();
  }, [user]);

  return { isPremium, subscriptionTier, expiresAt, loading };
};