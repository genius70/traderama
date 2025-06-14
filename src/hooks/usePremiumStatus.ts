
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type PremiumStatus = {
  isPremium: boolean;
  subscriptionTier?: string | null;
  expiresAt?: string | null;
};

export function usePremiumStatus(): PremiumStatus & { loading: boolean } {
  const { user } = useAuth();
  const [status, setStatus] = useState<PremiumStatus>({ isPremium: false, subscriptionTier: null, expiresAt: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatus({ isPremium: false, subscriptionTier: null, expiresAt: null });
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("subscription_tier, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus({ isPremium: false, subscriptionTier: null, expiresAt: null });
        } else {
          const now = new Date();
          const expires = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null;
          setStatus({
            isPremium: ["premium", "pro", "enterprise"].includes((data.subscription_tier || "").toLowerCase()),
            subscriptionTier: data.subscription_tier || null,
            expiresAt: expires ? expires.toISOString() : null,
          });
        }
        setLoading(false);
      });
  }, [user]);

  return { ...status, loading };
}
