import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Save, Trophy, Target, TrendingUp, MapPin, CreditCard, Shield, Calendar, AlertCircle, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string; // Added username
  name: string;
  email: string;
  bio?: string | null;
  role: string;
  referral_code: string;
  created_at: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  ethereum_wallet?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  employer?: string | null;
  annual_income_range?: string | null;
  source_of_funds?: string | null;
  trading_experience?: string | null;
  risk_tolerance?: string | null;
  identification_type?: string | null;
  identification_number?: string | null;
  identification_expiry?: string | null;
  stripe_customer_id?: string | null;
  stripe_account_id?: string | null;
  airtm_email?: string | null;
  airtm_username?: string | null;
  wise_account_id?: string | null;
  wise_email?: string | null;
  kyc_status?: string | null;
  profile_completion_percentage?: number | null;
  avatar_url?: string | null; // Added for avatar storage
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateReferralCode = (username: string, dob?: string | null) => {
    if (!username || !dob) return '';
    const year = new Date(dob).getFullYear().toString().slice(-4);
    return `${username.toLowerCase().replace(/\s/g, '')}${year}`;
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const profileData = data ? {
        ...data,
        username: data.username || '',
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'user',
        referral_code: data.referral_code || generateReferralCode(data.username, data.date_of_birth),
        created_at: data.created_at || new Date().toISOString(),
        avatar_url: data.avatar_url || ''
      } : null;

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user) return;

    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      toast({
        title: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleWhatsAppInvite = async () => {
    if (!profile?.whatsapp_number || !profile.referral_code) {
      toast({
        title: "Missing information",
        description: "Please provide a WhatsApp number and ensure your profile is complete",
        variant: "destructive",
      });
      return;
    }

    const inviteMessage = `Join our trading platform using my referral code: ${profile.referral_code}! Sign up at [Your Platform URL]`;
    const encodedMessage = encodeURIComponent(inviteMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    try {
      // Log invitation attempt
      await supabase.from('referral_logs').insert({
        user_id: user?.id,
        referral_code: profile.referral_code,
        invite_method: 'whatsapp',
        created_at: new Date().toISOString(),
      });

      window.open(whatsappUrl, '_blank');
      toast({
        title: "Invite sent",
        description: "WhatsApp invite opened successfully",
      });
    } catch (error) {
      console.error('Error logging WhatsApp invite:', error);
      toast({
        title: "Failed to send invite",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const updatedReferralCode = generateReferralCode(profile.username, profile.date_of_birth);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          name: profile.name,
          bio: profile.bio,
          phone_number: profile.phone_number,
          whatsapp_number: profile.whatsapp_number,
          ethereum_wallet: profile.ethereum_wallet,
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          state_province: profile.state_province,
          postal_code: profile.postal_code,
          country: profile.country,
          date_of_birth: profile.date_of_birth,
          nationality: profile.nationality,
          occupation: profile.occupation,
          employer: profile.employer,
          annual_income_range: profile.annual_income_range,
          source_of_funds: profile.source_of_funds,
          trading_experience: profile.trading_experience,
          risk_tolerance: profile.risk_tolerance,
          identification_type: profile.identification_type,
          identification_number: profile.identification_number,
          identification_expiry: profile.identification_expiry,
          stripe_customer_id: profile.stripe_customer_id,
          stripe_account_id: profile.stripe_account_id,
          airtm_email: profile.airtm_email,
          airtm_username: profile.airtm_username,
          wise_account_id: profile.wise_account_id,
          wise_email: profile.wise_email,
          referral_code: updatedReferralCode,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully",
      });
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitKYC = async () => {
    if (!profile || !user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'submitted',
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "KYC submission successful",
      });
      await fetchProfile();
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Failed to submit KYC",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-8">Profile not found</div>;
  }

  const completionPercentage = profile.profile_completion_percentage ?? 0;
  const isKYCCompliant = completionPercentage === 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className={`border-2 ${completionPercentage < 100 ? 'border-destructive' : 'border-primary'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${completionPercentage < 100 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                {completionPercentage < 100 ? 
                  <AlertCircle className="h-6 w-6 text-destructive" /> : 
                  <Shield className="h-6 w-6 text-primary" />
                }
              </div>
              <div>
                <CardTitle>Profile Completion: {completionPercentage}%</CardTitle>
                <CardDescription>
                  {completionPercentage < 100 
                    ? "Complete your profile to comply with KYC requirements and access all features"
                    : "Your profile is complete and KYC compliant"
                  }
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="kyc">KYC & Compliance</TabsTrigger>
          <TabsTrigger value="payments">Payment Accounts</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !isEditing}
                >
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referral_code">Referral Code</Label>
                    <Input
                      id="referral_code"
                      value={profile.referral_code}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      value={profile.phone_number || ''}
                      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1234567890"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                    <Input
                      id="whatsapp_number"
                      value={profile.whatsapp_number || ''}
                      onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1234567890"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethereum_wallet">Ethereum Wallet Address *</Label>
                    <Input
                      id="ethereum_wallet"
                      value={profile.ethereum_wallet || ''}
                      onChange={(e) => setProfile({ ...profile, ethereum_wallet: e.target.value })}
                      disabled={!isEditing}
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Invite Friends via WhatsApp</Label>
                  <Button 
                    variant="outline" 
                    onClick={handleWhatsAppInvite}
                    disabled={!profile.whatsapp_number || !profile.referral_code}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Invite via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      value={profile.address_line1 || ''}
                      onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={profile.address_line2 || ''}
                      onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state_province">State/Province *</Label>
                    <Input
                      id="state_province"
                      value={profile.state_province || ''}
                      onChange={(e) => setProfile({ ...profile, state_province: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={profile.postal_code || ''}
                      onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={profile.country || ''}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rest of the TabsContent components remain unchanged */}
      </Tabs>
    </div>
  );
};

export default Profile;
