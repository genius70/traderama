
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Globe, Linkedin, Users, Calendar, Edit3, Save, X, Phone, Wallet } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SocialProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  website_url: string;
  linkedin_url: string;
  profile_image_url: string;
  cover_image_url: string;
  followers_count: number;
  following_count: number;
  specialties: string[];
  created_at: string;
  whatsapp_number: string;
  ethereum_wallet: string;
}

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SocialProfile>>({});

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      
      // Handle missing properties by providing defaults
      const profileData: SocialProfile = {
        ...data,
        whatsapp_number: data.whatsapp_number || '',
        ethereum_wallet: data.ethereum_wallet || '',
        specialties: data.specialties || [],
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0,
        profile_image_url: data.profile_image_url || '',
        cover_image_url: data.cover_image_url || '',
        website_url: data.website_url || '',
        linkedin_url: data.linkedin_url || '',
        bio: data.bio || '',
        location: data.location || ''
      };
      
      setProfile(profileData);
      setEditForm(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location,
          website_url: editForm.website_url,
          linkedin_url: editForm.linkedin_url,
          whatsapp_number: editForm.whatsapp_number || '',
          ethereum_wallet: editForm.ethereum_wallet || '',
          specialties: editForm.specialties
        })
        .eq('id', user.id);

      if (error) throw error;

      // Create updated profile with proper typing
      const updatedProfile: SocialProfile = {
        ...profile,
        ...editForm,
        whatsapp_number: editForm.whatsapp_number || '',
        ethereum_wallet: editForm.ethereum_wallet || ''
      };
      
      setProfile(updatedProfile);
      setEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>The requested profile could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if profile is complete (required fields)
  const isProfileComplete = profile.location && profile.whatsapp_number && profile.ethereum_wallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Profile completion warning */}
      {isOwnProfile && !isProfileComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please complete your profile by adding your location, WhatsApp number, and Ethereum wallet to access all features.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-6 overflow-hidden">
          {profile.cover_image_url && (
            <img 
              src={profile.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profile_image_url} />
              <AvatarFallback className="text-2xl bg-white text-blue-600">
                {profile.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              {editing ? (
                <div className="space-x-2">
                  <Button size="sm" onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setEditing(true)} variant="outline" className="bg-white">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    {editing ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="text-2xl font-bold mb-2"
                        placeholder="Your name"
                      />
                    ) : (
                      <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    )}
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Bio</Label>
                  {editing ? (
                    <Textarea
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </Label>
                    {editing ? (
                      <Input
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="Your location"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.location || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Label>
                    {editing ? (
                      <Input
                        value={editForm.whatsapp_number || ''}
                        onChange={(e) => setEditForm({...editForm, whatsapp_number: e.target.value})}
                        placeholder="Your WhatsApp number"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">{profile.whatsapp_number || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Wallet className="h-4 w-4 mr-1" />
                      Ethereum Wallet
                    </Label>
                    {editing ? (
                      <Input
                        value={editForm.ethereum_wallet || ''}
                        onChange={(e) => setEditForm({...editForm, ethereum_wallet: e.target.value})}
                        placeholder="Your Ethereum wallet address"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1 text-sm break-all">
                        {profile.ethereum_wallet || 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </Label>
                    {editing ? (
                      <Input
                        value={editForm.website_url || ''}
                        onChange={(e) => setEditForm({...editForm, website_url: e.target.value})}
                        placeholder="Your website"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">
                        {profile.website_url ? (
                          <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.website_url}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </Label>
                    {editing ? (
                      <Input
                        value={editForm.linkedin_url || ''}
                        onChange={(e) => setEditForm({...editForm, linkedin_url: e.target.value})}
                        placeholder="Your LinkedIn profile"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 mt-1">
                        {profile.linkedin_url ? (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Specialties</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                    {(!profile.specialties || profile.specialties.length === 0) && (
                      <p className="text-gray-500 text-sm">No specialties added</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Social Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-semibold">{profile.followers_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Following</span>
                  <span className="font-semibold">{profile.following_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-semibold">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
