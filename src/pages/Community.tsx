import Header from '@/components/layout/Header';
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import PremiumGroupPostComposer from "@/components/community/PremiumGroupPostComposer";
import PremiumGroupCheckoutDialog from "@/components/community/PremiumGroupCheckoutDialog";
import InviteFriend from "@/components/community/InviteFriend";
import CommunityCommentModal from "@/components/community/CommunityCommentModal";
import TipModal from "@/components/community/TipModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Crown,
  Users,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles: {
    name?: string;
    email?: string;
  };
}

const Community = () => {
  const [posts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("feed");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          profiles (name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  async function handlePost() {
    if (!newPost.trim() || !user) return;
    
    setPosting(true);
    try {
      const { error } = await supabase
        .from("community_posts")
        .insert([{ content: newPost, user_id: user.id }]);

      if (error) throw error;

      setNewPost("");
      toast({ title: "Post created successfully!" });
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({ 
        title: "Error creating post", 
        description: "Please try again", 
        variant: "destructive" 
      });
    }
    setPosting(false);  
  }

  const handleLike = () => {
    fetchPosts();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
    <Header />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Community</h1>
          <p className="text-gray-600">Connect with traders, share insights, and learn together</p>
        </div>
        <Button onClick={() => setCheckoutOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Crown className="h-4 w-4 mr-2" />
          Create Premium Group
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Post composer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Share Your Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind about trading today?"
                    className="min-h-[100px]"
                  />
                  <Button onClick={handlePost} disabled={posting || !newPost.trim()}>
                    {posting ? "Posting..." : "Share Post"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts feed */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <CommunityPostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLike}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Trading Groups
              </CardTitle>
              <CardDescription>Join trading groups to discuss strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No groups available yet.</p>
                <p className="text-sm">Create a premium group to get started!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  Premium Trading Group
                </CardTitle>
                <CardDescription>
                  Create exclusive content for your premium subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PremiumGroupPostComposer onPost={fetchPosts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-gray-600">Premium Subscribers</p>
                  </div>
                  <div className="text-center p-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-sm text-gray-600">Posts This Month</p>
                  </div>
                  <div className="text-center p-4">
                    <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold">$2,340</p>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invite">
          <InviteFriend />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PremiumGroupCheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <CommunityCommentModal 
        postId={selectedPostId} 
        open={commentModalOpen} 
        onOpenChange={setCommentModalOpen} 
      />
      {selectedPost && (
        <TipModal 
          open={tipModalOpen} 
          onOpenChange={setTipModalOpen} 
          post={selectedPost}
        />
      )}
    </div>
  );
};

export default Community;
