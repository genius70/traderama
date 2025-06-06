
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Wallet, User, Mail, Globe, Linkedin, Twitter, Calendar, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialProfile {
  id: string;
  user_id: string;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  followers_count: number;
  following_count: number;
  total_strategies: number;
  total_profit: number;
  trading_experience: number | null;
  specialties: string[] | null;
  whatsapp_number: string | null;
  ethereum_wallet: string | null;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SocialProfile>>({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const { toast } = useToast();

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, userId]);

  const fetchProfile = async () => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        // Handle the case where new fields might not exist in the database yet
        const completeProfile: SocialProfile = {
          ...data,
          whatsapp_number: data.whatsapp_number || null,
          ethereum_wallet: data.ethereum_wallet || null,
        };
        setProfile(completeProfile);
        setEditForm(completeProfile);
        
        // Check if profile is complete with required fields
        const isComplete = !!(completeProfile.location && completeProfile.whatsapp_number && completeProfile.ethereum_wallet);
        setIsProfileComplete(isComplete);
      } else {
        // Create new profile if it doesn't exist
        await createProfile(targetUserId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const createProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('social_profiles')
        .insert([
          {
            user_id: targetUserId,
            bio: '',
            location: null,
            whatsapp_number: null,
            ethereum_wallet: null,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      if (data) {
        const newProfile: SocialProfile = {
          ...data,
          whatsapp_number: data.whatsapp_number || null,
          ethereum_wallet: data.ethereum_wallet || null,
        };
        setProfile(newProfile);
        setEditForm(newProfile);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (!profile) return;

      const { error } = await supabase
        .from('social_profiles')
        .update({
          bio: editForm.bio,
          location: editForm.location,
          website_url: editForm.website_url,
          twitter_handle: editForm.twitter_handle,
          linkedin_url: editForm.linkedin_url,
          whatsapp_number: editForm.whatsapp_number,
          ethereum_wallet: editForm.ethereum_wallet,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      await fetchProfile();
      setIsEditing(false);
      
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show profile completion form if profile is incomplete and it's the user's own profile
  if (isOwnProfile && !isProfileComplete && profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete these required fields before accessing the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                placeholder="Enter your location"
                required
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                value={editForm.whatsapp_number || ''}
                onChange={(e) => setEditForm({...editForm, whatsapp_number: e.target.value})}
                placeholder="Enter your WhatsApp number"
                required
              />
            </div>
            <div>
              <Label htmlFor="ethereum">Ethereum Wallet Address *</Label>
              <Input
                id="ethereum"
                value={editForm.ethereum_wallet || ''}
                onChange={(e) => setEditForm({...editForm, ethereum_wallet: e.target.value})}
                placeholder="Enter your Ethereum wallet address"
                required
              />
            </div>
            <Button 
              onClick={handleSave} 
              className="w-full"
              disabled={!editForm.location || !editForm.whatsapp_number || !editForm.ethereum_wallet}
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-6">
          {profile.cover_image_url && (
            <img 
              src={profile.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-8 -mt-20 relative z-10">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            {profile.profile_image_url ? (
              <img 
                src={profile.profile_image_url} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.email?.split('@')[0]}</h1>
                {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder="Your location"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    value={editForm.whatsapp_number || ''}
                    onChange={(e) => setEditForm({...editForm, whatsapp_number: e.target.value})}
                    placeholder="Your WhatsApp number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ethereum">Ethereum Wallet Address *</Label>
                <Input
                  id="ethereum"
                  value={editForm.ethereum_wallet || ''}
                  onChange={(e) => setEditForm({...editForm, ethereum_wallet: e.target.value})}
                  placeholder="Your Ethereum wallet address"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editForm.website_url || ''}
                    onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <Input
                    id="twitter"
                    value={editForm.twitter_handle || ''}
                    onChange={(e) => setEditForm({...editForm, twitter_handle: e.target.value})}
                    placeholder="@username"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={editForm.linkedin_url || ''}
                  onChange={(e) => setEditForm({...editForm, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Stats and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.followers_count}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.following_count}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.total_strategies}</div>
                  <div className="text-sm text-gray-600">Strategies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${profile.total_profit.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Profit</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              {profile.whatsapp_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.whatsapp_number}</span>
                </div>
              )}
              
              {profile.ethereum_wallet && (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-mono text-xs break-all">{profile.ethereum_wallet}</span>
                </div>
              )}
              
              {profile.website_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {profile.website_url}
                  </a>
                </div>
              )}
              
              {profile.linkedin_url && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              
              {profile.twitter_handle && (
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.twitter_handle}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
