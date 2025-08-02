import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Save, Trophy, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  role: string;
  referral_code: string;
  created_at: string;
}

interface ProfileStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  activeStrategies: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    activeStrategies: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data ? {
        id: data.id,
        name: data.name || 'Unknown User',
        email: data.email,
        bio: data.bio || '',
        role: data.role,
        referral_code: data.referral_code || '',
        created_at: data.created_at
      } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile - Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Mock stats - in real app, these would come from actual trade data
      setStats({
        totalTrades: 127,
        winRate: 68.5,
        totalPnL: 15420.50,
        activeStrategies: 3
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user, fetchProfile, fetchStats]);

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          bio: profile.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated - Your profile has been successfully updated",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed - Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-8">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Photo</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <Label>Role</Label>
                    <Badge variant="secondary" className="ml-2">
                      {profile.role}
                    </Badge>
                  </div>
                  <div>
                    <Label>Member since</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Referral Code</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={profile.referral_code} disabled className="bg-gray-50" />
                    <Button variant="outline" size="sm">Copy</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Total Trades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTrades}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
                <p className="text-xs text-gray-600">Success rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Total P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${stats.totalPnL.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">All time profit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeStrategies}</div>
                <p className="text-xs text-gray-600">Currently following</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Your trading milestones and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">First Trade</h3>
                      <p className="text-sm text-gray-600">Executed your first successful trade</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">Profit Milestone</h3>
                      <p className="text-sm text-gray-600">Achieved $10,000 in total profits</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold">Strategy Creator</h3>
                      <p className="text-sm text-gray-600">Create your first trading strategy</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold">Community Leader</h3>
                      <p className="text-sm text-gray-600">Get 100 followers in the community</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;