
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, Crown, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import CommunityPostCard from '@/components/community/CommunityPostCard';
import CommunityCommentModal from '@/components/community/CommunityCommentModal';
import TipModal from '@/components/community/TipModal';
import InviteFriend from '@/components/community/InviteFriend';
import SocialShareButton from '@/components/community/SocialShareButton';
import PremiumGroupPostComposer from '@/components/community/PremiumGroupPostComposer';

const Community = () => {
  const { user, loading } = useAuth();

  const [posts, setPosts] = useState([
    {
      id: 1,
      profiles: { name: 'Royan Shaw', email: 'royan.shaw@gmail.com' },
      content: 'Excited to share my latest iron condor strategy! Check it out and let me know what you think. #ironcondor #options',
      likes_count: 120,
      comments_count: 35,
      shares_count: 5,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isPremium: false
    },
    {
      id: 2,
      profiles: { name: 'Alice Johnson', email: 'alice.johnson@gmail.com' },
      content: 'Just hit a 30% return on my last trade using a simple covered call strategy. Sometimes the basics are the best! #coveredcall #trading',
      likes_count: 85,
      comments_count: 22,
      shares_count: 3,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isPremium: false
    },
    {
      id: 3,
      profiles: { name: 'TraderPro', email: 'traderpro@gmail.com' },
      content: 'Analyzing market trends for the upcoming week. Expecting volatility in tech stocks due to earnings reports. #marketanalysis #stocks',
      likes_count: 210,
      comments_count: 68,
      shares_count: 15,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isPremium: true
    },
    {
      id: 4,
      profiles: { name: 'OptionsQueen', email: 'optionsqueen@gmail.com' },
      content: 'Anyone else trading strangles this week? Looking for insights and tips! #strangles #options',
      likes_count: 150,
      comments_count: 45,
      shares_count: 8,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isPremium: true
    },
  ]);

  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const openCommentModal = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setSelectedPostId('');
    setCommentModalOpen(false);
  };

  const openTipModal = (post: any) => {
    setSelectedPost(post);
    setTipModalOpen(true);
  };

  const closeTipModal = () => {
    setSelectedPost(null);
    setTipModalOpen(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-4 sm:p-6">
        {/* Community Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Trader Community
          </h1>
          <p className="text-gray-600">Share your strategies, insights, and connect with fellow traders</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Active Traders
              </CardTitle>
              <CardDescription>Connect with fellow traders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">4,589</div>
              <p className="text-sm text-gray-500">In the last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Posts Today
              </CardTitle>
              <CardDescription>New discussions and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">326</div>
              <p className="text-sm text-gray-500">Shared today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Trending Strategies
              </CardTitle>
              <CardDescription>Top performing strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">Iron Condor</div>
              <p className="text-sm text-gray-500">Most discussed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-600" />
                Premium Members
              </CardTitle>
              <CardDescription>Exclusive content and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">872</div>
              <p className="text-sm text-gray-500">Active subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Community Feed */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Feed</h2>

          {/* Post Composer - Using a placeholder groupId for now */}
          <PremiumGroupPostComposer />

          {/* Community Posts */}
          <div className="space-y-4">
            {posts.map(post => (
              <CommunityPostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        </section>

        {/* Invite Friends Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Invite Friends</CardTitle>
              <CardDescription>Share the Trader Community with your friends and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteFriend />
            </CardContent>
          </Card>
        </section>

        {/* Social Sharing Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Share the Community</CardTitle>
              <CardDescription>Spread the word and help grow our community</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-around">
              <SocialShareButton postData={{
                id: 'community',
                content: 'Check out the Trader Community!',
                author: 'Traderama',
                type: 'post'
              }} />
              <SocialShareButton postData={{
                id: 'community-twitter',
                content: 'Join the Trader Community for insights and strategies!',
                author: 'Traderama',
                type: 'post'
              }} />
              <SocialShareButton postData={{
                id: 'community-linkedin',
                content: 'Explore trading strategies and connect with experts in the Trader Community.',
                author: 'Traderama',
                type: 'post'
              }} />
            </CardContent>
          </Card>
        </section>

        {/* Comment Modal */}
        <CommunityCommentModal
          postId={selectedPostId}
          open={commentModalOpen}
          onOpenChange={setCommentModalOpen}
        />

        {/* Tip Modal */}
        <TipModal
          open={tipModalOpen}
          onOpenChange={setTipModalOpen}
          post={selectedPost}
        />
      </main>
    </div>
  );
};

export default Community;
