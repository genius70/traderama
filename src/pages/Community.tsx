
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import InviteFriend from '@/components/community/InviteFriend';
import SocialShareButton from '@/components/community/SocialShareButton';
import PremiumGroupPostComposer from '@/components/community/PremiumGroupPostComposer';
import CommunityStats from '@/components/community/CommunityStats';
import CommunityFilters from '@/components/community/CommunityFilters';
import { useCommunityPosts, PostFilters } from '@/hooks/useCommunityPosts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<PostFilters>({ sortBy: 'recent' });
  const { posts, loading: postsLoading, error, refetch } = useCommunityPosts(filters);

  const handleSortChange = (sortBy: 'recent' | 'popular' | 'trending') => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handlePostTypeChange = (postType: string) => {
    setFilters((prev) => ({ 
      ...prev, 
      postType: postType === 'all' ? undefined : postType 
    }));
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
