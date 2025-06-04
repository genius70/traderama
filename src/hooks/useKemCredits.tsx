
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useKemCredits = () => {
  const [credits, setCredits] = useState({ earned: 0, spent: 0, available: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('kem_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching credits:', error);
      return;
    }

    if (data) {
      setCredits({
        earned: data.credits_earned,
        spent: data.credits_spent,
        available: data.credits_earned - data.credits_spent
      });
    }
  };

  const awardCredits = async (activityType: string, creditsAmount: number, targetId?: string, referredBy?: string) => {
    if (!user) return;

    setLoading(true);

    try {
      // Record the activity
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert([{
          user_id: user.id,
          activity_type: activityType,
          credits_awarded: creditsAmount,
          target_id: targetId,
          referred_by: referredBy
        }]);

      if (activityError) throw activityError;

      // Update total credits
      const { error: creditsError } = await supabase
        .from('kem_credits')
        .upsert([{
          user_id: user.id,
          credits_earned: credits.earned + creditsAmount,
          credits_spent: credits.spent,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id' });

      if (creditsError) throw creditsError;

      // Award credits to referrer if applicable
      if (referredBy && activityType === 'referral_accepted') {
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referredBy)
          .single();

        if (referrerProfile) {
          await supabase
            .from('user_activities')
            .insert([{
              user_id: referrerProfile.id,
              activity_type: 'referral_reward',
              credits_awarded: 2,
              target_id: user.id
            }]);

          await supabase.rpc('increment_credits', {
            user_id: referrerProfile.id,
            amount: 2
          });
        }
      }

      await fetchCredits();

      toast({
        title: "Credits Earned!",
        description: `You earned ${creditsAmount} KEM credits for ${activityType.replace('_', ' ')}.`,
      });

    } catch (error: any) {
      console.error('Error awarding credits:', error);
      toast({
        title: "Error",
        description: "Failed to award credits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    credits,
    loading,
    awardCredits,
    refreshCredits: fetchCredits
  };
};
