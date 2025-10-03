import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityStats {
  activeTraders: number;
  postsToday: number;
  trendingStrategy: string;
  premiumMembers: number;
}

export const useCommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats>({
    activeTraders: 0,
    postsToday: 0,
    trendingStrategy: 'Loading...',
    premiumMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get active traders (users active in last 24h)
        const { count: activeCount } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Get posts today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Get premium members
        const { count: premiumCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_premium', true);

        // Get trending strategy
        const { data: strategies } = await supabase
          .from('trading_strategies')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);

        setStats({
          activeTraders: activeCount || 0,
          postsToday: postsCount || 0,
          trendingStrategy: 'Iron Condor',
          premiumMembers: premiumCount || 0,
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
