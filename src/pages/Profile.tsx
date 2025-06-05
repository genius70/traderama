
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MapPin, Globe, Twitter, Linkedin, TrendingUp, Target, Edit, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import ProfitLossPanel from '@/components/trading/ProfitLossPanel';
import SocialShareButton from '@/components/community/SocialShareButton';
import InviteFriend from '@/components/community/InviteFriend';

interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_tier: string;
}

interface SocialProfile {
  bio: string;
  profile_image_url: string;
  cover_image_url: string;
  location: string;
  website_url: string;
  twitter_handle: string;
  linkedin_url: string;
  trading_experience: number;
  specialties: string[];
  followers_count: number;
  following_count: number;
  total_strategies: number;
  total_profit: number;
  whatsapp_number: string;
  ethereum_wallet: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialProfile, setSocialProfile] = useState<SocialProfile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [posts, setPosts] = useState([]);
  const [profileComplete, setProfileComplete] = useState(false);
  const [editingLocation, setEditingLocation] = useState('');
  const [editingWhatsapp, setEditingWhatsapp] = useState('');
  const [editingWallet, setEditingWallet] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    setIsOwnProfile(!userId || userId === user.id);
    fetchProfile(targetUserId);
    fetchSocialProfile(targetUserId);
    fetchStrategies(targetUserId);
    fetchPosts(targetUserId);
    
    if (userId && userId !== user.id) {
      checkFollowStatus(userId);
    }
  }, [userId, user?.id]);

  useEffect(() => {
    if (socialProfile && isOwnProfile) {
      const isComplete = socialProfile.location && 
                        socialProfile.whatsapp_number && 
                        socialProfile.ethereum_wallet;
      setProfileComplete(!!isComplete);
    }
  }, [socialProfile, isOwnProfile]);

  const fetchProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const fetchSocialProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setSocialProfile(data);
      
      if (data && isOwnProfile) {
        setEditingLocation(data.location || '');
        setEditingWhatsapp(data.whatsapp_number || '');
        setEditingWallet(data.ethereum_wallet || '');
      }
    } catch (error) {
      console.error('Error fetching social profile:', error);
    }
  };

  const fetchStrategies = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('creator_id', targetUserId)
        .eq('status', 'published');

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const fetchPosts = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const checkFollowStatus = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!userId || !user) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "Unfollowed successfully" });
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({ title: "Following successfully" });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const updateSocialProfile = async (updates: Partial<SocialProfile>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .upsert({
          user_id: user.id,
          ...updates
        });

      if (error) throw error;
      setSocialProfile({ ...socialProfile, ...updates } as SocialProfile);
      toast({ title: "Profile updated successfully" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleCompleteProfile = async () => {
    if (!editingLocation || !editingWhatsapp || !editingWallet) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields to continue",
        variant: "destructive",
      });
      return;
    }

    await updateSocialProfile({
      location: editingLocation,
      whatsapp_number: editingWhatsapp,
      ethereum_wallet: editingWallet
    });
    
    setIsEditing(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  // Show profile completion form for own profile if not complete
  if (isOwnProfile && !profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-4 sm:p-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Please provide the following required information to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-red-600">Location *</label>
                <Input 
                  value={editingLocation}
                  onChange={(e) => setEditingLocation(e.target.value)}
                  placeholder="City, Country"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-red-600">WhatsApp Number *</label>
                <Input 
                  value={editingWhatsapp}
                  onChange={(e) => setEditingWhatsapp(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-red-600">Ethereum Wallet Address *</label>
                <Input 
                  value={editingWallet}
                  onChange={(e) => setEditingWallet(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              <Button 
                onClick={handleCompleteProfile}
                className="w-full"
                disabled={!editingLocation || !editingWhatsapp || !editingWallet}
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6">
        {/* Cover Image */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-6">
          {socialProfile?.cover_image_url && (
            <img 
              src={socialProfile.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={socialProfile?.profile_image_url} />
              <AvatarFallback className="text-2xl">
                {profile.name?.[0] || profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {profile.name || profile.email}
                  </h1>
                  {socialProfile?.bio && (
                    <p className="text-gray-600 mt-1">{socialProfile.bio}</p>
                  )}
                </div>
                
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Button 
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "default" : "outline"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Save' : 'Edit Profile'}
                    </Button>
                  ) : (
                    <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{socialProfile?.followers_count || 0} followers</span>
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  <span>{socialProfile?.total_strategies || 0} strategies</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>${(socialProfile?.total_profit || 0).toFixed(2)} profit</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {socialProfile?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{socialProfile.location}</span>
                  </div>
                )}
                {socialProfile?.website_url && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <a href={socialProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {socialProfile?.twitter_handle && (
                  <div className="flex items-center">
                    <Twitter className="h-4 w-4 mr-1" />
                    <a href={`https://twitter.com/${socialProfile.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      @{socialProfile.twitter_handle}
                    </a>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {socialProfile?.specialties && socialProfile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialProfile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && isOwnProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea 
                  defaultValue={socialProfile?.bio || ''}
                  onBlur={(e) => updateSocialProfile({ bio: e.target.value })}
                  placeholder="Tell us about yourself and your trading experience..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-red-600">Location *</label>
                  <Input 
                    value={editingLocation}
                    onChange={(e) => setEditingLocation(e.target.value)}
                    onBlur={(e) => updateSocialProfile({ location: e.target.value })}
                    placeholder="City, Country"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input 
                    defaultValue={socialProfile?.website_url || ''}
                    onBlur={(e) => updateSocialProfile({ website_url: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-red-600">WhatsApp Number *</label>
                  <Input 
                    value={editingWhatsapp}
                    onChange={(e) => setEditingWhatsapp(e.target.value)}
                    onBlur={(e) => updateSocialProfile({ whatsapp_number: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-red-600">Ethereum Wallet *</label>
                  <Input 
                    value={editingWallet}
                    onChange={(e) => setEditingWallet(e.target.value)}
                    onBlur={(e) => updateSocialProfile({ ethereum_wallet: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Content Tabs */}
        <Tabs defaultValue="pnl" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="pnl">P&L Analytics</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="invite">Invite Friends</TabsTrigger>}
          </TabsList>

          <TabsContent value="pnl">
            <ProfitLossPanel 
              userId={profile.id} 
              userName={profile.name || profile.email} 
            />
          </TabsContent>

          <TabsContent value="strategies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strategies.map((strategy: any) => (
                <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{strategy.title}</CardTitle>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline">{strategy.strategy_config?.timeframe || 'Weekly'}</Badge>
                      <span className="text-sm text-gray-600">{strategy.fee_percentage}% fee</span>
                    </div>
                    <SocialShareButton 
                      postData={{
                        id: strategy.id,
                        content: `Check out my trading strategy: ${strategy.title}`,
                        author: profile.name || profile.email,
                        type: 'strategy'
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-6">
              {posts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardDescription>{new Date(post.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                      <SocialShareButton 
                        postData={{
                          id: post.id,
                          content: post.content,
                          author: profile.name || profile.email,
                          type: 'post',
                          metrics: {
                            likes: post.likes_count,
                            comments: post.comments_count,
                            shares: post.shares_count
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Trading activity and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Activity feed coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="invite">
              <div className="flex justify-center">
                <InviteFriend />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
