
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback } from 'react';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import InviteFriend from '@/components/community/InviteFriend';
import SocialShareButton from '@/components/community/SocialShareButton';
import PremiumGroupPostComposer from '@/components/community/PremiumGroupPostComposer';
import CommunityStats from '@/components/community/CommunityStats';
import CommunityFilters from '@/components/community/CommunityFilters';
import { useCommunityPosts, PostFilters } from '@/hooks/useCommunityPosts';
import { AlertCircle, RefreshCw, Copy, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<PostFilters>({ sortBy: 'recent' });
  const { posts, loading: postsLoading, error, refetch } = useCommunityPosts(filters);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  const handleSortChange = (sortBy: 'recent' | 'popular' | 'trending') => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handlePostTypeChange = (postType: string) => {
    setFilters((prev) => ({ 
      ...prev, 
      postType: postType === 'all' ? undefined : postType 
    }));
  };

  const fetchReferralCode = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setReferralCode(data?.referral_code || null);
    } catch (error) {
      console.error('Error fetching referral code:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReferralCode();
    }
  }, [user, fetchReferralCode]);

  const copyReferralCode = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(`https://www.traderama.pro/?ref_id=${referralCode}`);
      setCopiedReferral(true);
      toast({
        title: 'Referral link copied!',
      });
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy referral link',
        variant: 'destructive',
      });
    }
  };

  const inviteViaWhatsApp = async () => {
    if (!referralCode) return;

    try {
      const referralUrl = `https://www.traderama.pro/?ref_id=${referralCode}`;
      const message = encodeURIComponent(
        `🚀 Hey! I'm using Traderama, an awesome trading platform. Join using my referral link: ${referralUrl} to get exclusive benefits!`
      );
      const whatsappUrl = `https://wa.me/?text=${message}`;

      await supabase.from('notifications').insert({
        sender_id: user?.id,
        title: 'WhatsApp Referral Invite',
        content: `Referral invite sent via WhatsApp: ${referralCode}`,
        notification_type: 'referral',
      });

      window.open(whatsappUrl, '_blank');
      toast({
        title: 'Referral invite sent!',
      });
    } catch (error) {
      toast({
        title: 'Failed to send invite',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Community Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Trader Community
          </h1>
          <p className="text-gray-600 text-lg">
            Share strategies, insights, and connect with fellow traders worldwide
          </p>
        </div>

        {/* Community Stats */}
        <CommunityStats />

        {/* Referral Code Card */}
        {referralCode && (
          <Card className="mb-8 border-primary/20 bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Your Referral Code</h3>
                  <p className="text-muted-foreground">Share with friends to earn rewards</p>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="px-3 py-2 bg-background border rounded font-mono text-lg">
                    {referralCode}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyReferralCode}>
                    {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={inviteViaWhatsApp}
                    className="text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Feed */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Community Feed</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={postsLoading}
              className="hover-scale"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${postsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Post Composer */}
          <div className="mb-6 animate-fade-in">
            <PremiumGroupPostComposer />
          </div>

          {/* Filters */}
          <CommunityFilters
            sortBy={filters.sortBy}
            onSortChange={handleSortChange}
            postType={filters.postType}
            onPostTypeChange={handlePostTypeChange}
          />

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                Failed to load posts. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {postsLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Community Posts */}
          {!postsLoading && !error && (
            <div className="space-y-4 animate-fade-in">
              {posts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-500 text-lg mb-4">
                      No posts yet. Be the first to share!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <CommunityPostCard key={post.id} post={post} onLike={refetch} />
                ))
              )}
            </div>
          )}
        </section>

        {/* Community Engagement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Invite Friends Section */}
          <Card className="hover:shadow-lg transition-shadow animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Invite Friends</CardTitle>
              <CardDescription>
                Share the Trader Community with your friends and earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InviteFriend />
            </CardContent>
          </Card>

          {/* Social Sharing Section */}
          <Card className="hover:shadow-lg transition-shadow animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Share the Community</CardTitle>
              <CardDescription>
                Spread the word and help grow our trading community
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 justify-center">
              <SocialShareButton
                postData={{
                  id: 'community',
                  content: 'Check out the Trader Community on Traderama!',
                  author: 'Traderama',
                  type: 'post',
                }}
              />
              <SocialShareButton
                postData={{
                  id: 'community-twitter',
                  content: 'Join the Trader Community for insights and strategies! #trading',
                  author: 'Traderama',
                  type: 'post',
                }}
              />
              <SocialShareButton
                postData={{
                  id: 'community-linkedin',
                  content: 'Explore trading strategies and connect with experts in the Trader Community.',
                  author: 'Traderama',
                  type: 'post',
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Community;
