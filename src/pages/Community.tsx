import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, MessageSquare, Heart, Share2, TrendingUp, Target, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import PremiumGroupCheckoutDialog from "@/components/community/PremiumGroupCheckoutDialog";
import CommunityPostCard from "@/components/community/CommunityPostCard";
import PremiumGroupPostComposer from "@/components/community/PremiumGroupPostComposer";

const Community = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchPosts();
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (name, email)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_groups')
        .select(`
          *,
          profiles (name, email)
        `)
        .eq('group_type', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPost,
          post_type: 'text'
        });

      if (error) throw error;
      setNewPost('');
      fetchPosts();
      toast({ title: "Post created successfully" });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) return;

    try {
      const { error } = await supabase
        .from('trading_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          creator_id: user.id,
          group_type: 'public'
        });

      if (error) throw error;
      setNewGroup({ name: '', description: '' });
      setIsCreateGroupOpen(false);
      fetchGroups();
      toast({ title: "Group created successfully" });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error creating group",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleCreatePremiumGroup = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          productName: 'Premium Group Access',
          amount: 5000, // $50.00 in cents
          currency: 'usd'
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating premium group checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start premium group purchase",
        variant: "destructive",
      });
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .insert({
          group_id: groupId,
          user_id: user.id
        });

      if (error) throw error;
      toast({ title: "Joined group successfully" });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error joining group",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trading Community</h1>
          <p className="text-gray-600">Connect with fellow traders, share ideas, and learn together</p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="groups">Trading Groups</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Share trading ideas, market analysis, or insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind about the markets today?"
                  rows={3}
                />
                <Button onClick={createPost} disabled={!newPost.trim()}>
                  Share Post
                </Button>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post: any) => (
                <CommunityPostCard key={post.id} post={post} onLike={fetchPosts} onCommentAdded={fetchPosts} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Trading Groups</h2>
                <p className="text-gray-600">Join groups to discuss specific trading topics</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                <Button 
                  onClick={() => setIsPremiumDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Create Premium Group - $50/mo
                </Button>
                
                <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Trading Group</DialogTitle>
                      <DialogDescription>
                        Create a new group for traders to discuss specific topics
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Group Name</label>
                        <Input
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                          placeholder="Iron Condor Masters"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          placeholder="A group for discussing iron condor strategies..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={createGroup} className="w-full">
                        Create Group
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Example: Only show the PremiumGroupPostComposer if user is a premium group owner in this context */}
            <PremiumGroupPostComposer groupId="demo-premium-group" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group: any) => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{group.members_count} members</span>
                      </div>
                      <Button size="sm" onClick={() => joinGroup(group.id)}>
                        Join
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Badge variant="outline">Public Group</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <PremiumGroupCheckoutDialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen} />
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Trending Topics</span>
                  </CardTitle>
                  <CardDescription>Popular discussions in the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#IronCondorStrategy</span>
                      <Badge variant="secondary">125 posts</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#SPYTrades</span>
                      <Badge variant="secondary">89 posts</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#OptionsTrading</span>
                      <Badge variant="secondary">67 posts</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Top Performers</span>
                  </CardTitle>
                  <CardDescription>Most successful strategy creators this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>RS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Royan Shaw</p>
                        <p className="text-xs text-gray-500">+15.2% this month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
