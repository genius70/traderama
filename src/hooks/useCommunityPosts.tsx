import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  images?: string[];
  is_public: boolean;
  post_type: string;
  profiles?: {
    name?: string;
    email?: string;
    profile_image_url?: string;
  };
}

export interface PostFilters {
  sortBy: 'recent' | 'popular' | 'trending';
  postType?: string;
}

export const useCommunityPosts = (filters: PostFilters = { sortBy: 'recent' }) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          shares_count,
          images,
          is_public,
          post_type,
          profiles (
            name,
            email,
            profile_image_url
          )
        `)
        .eq('is_public', true);

      // Apply sorting
      switch (filters.sortBy) {
        case 'popular':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'trending':
          query = query.order('comments_count', { ascending: false });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply post type filter
      if (filters.postType) {
        query = query.eq('post_type', filters.postType);
      }

      const { data, error: fetchError } = await query.limit(20);

      if (fetchError) throw fetchError;

      setPosts(data as CommunityPost[] || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error loading posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};
