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
import { User, Mail, Save, Trophy, Target, TrendingUp, MapPin, CreditCard, Shield, Calendar, AlertCircle, Camera, Copy, Check, Share, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  bio?: string | null;
  role: string;
  referral_code: string;
  avatar_url?: string | null;
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate referral code from username and date of birth
  const generateReferralCode = (username: string, dateOfBirth: string): string => {
    if (!username || !dateOfBirth) return '';
    const year = new Date(dateOfBirth).getFullYear().toString();
    const lastFourDigits = year.slice(-4);
    return `${username.toLowerCase()}${lastFourDigits}`;
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
      setProfile(data ? {
        ...data,
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        role: data.role || 'user',
        referral_code: data.referral_code || '',
        created_at: data.created_at || new Date().toISOString()
      } : null);
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

  // Update referral code when username or date of birth changes
  useEffect(() => {
    if (profile && profile.username && profile.date_of_birth) {
      const newReferralCode = generateReferralCode(profile.username, profile.date_of_birth);
      if (newReferralCode !== profile.referral_code) {
        setProfile(prev => prev ? { ...prev, referral_code: newReferralCode } : null);
      }
    }
  }, [profile?.username, profile?.date_of_birth]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG or JPEG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setAvatarUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
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
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          username: profile.username,
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
          referral_code: profile.referral_code,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated successfully",
      });
      setIsEditing(false);
      await fetchProfile(); // Refresh to get updated completion percentage
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

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;
    
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopiedReferral(true);
      toast({
        title: "Referral code copied!",
      });
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy referral code",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!profile?.referral_code || !profile?.whatsapp_number) return;
    
    const message = encodeURIComponent(
      `🚀 Join me on our trading platform! Use my referral code: ${profile.referral_code} to get started with exclusive benefits. Sign up now!`
    );
    const whatsappUrl = `https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const inviteViaWhatsApp = () => {
    if (!profile?.referral_code) return;
    
    const message = encodeURIComponent(
      `🚀 Hey! I'm using this amazing trading platform and thought you'd be interested. Use my referral code: ${profile.referral_code} to join and get exclusive benefits! Click here to sign up: ${window.location.origin}/signup?ref=${profile.referral_code}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
      {/* Profile Completion Header */}
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

      {/* Referral Code Display */}
      {profile.referral_code && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Your Referral Code</h3>
                <p className="text-muted-foreground">Share with friends to earn rewards</p>
              </div>
              <div className="flex items-center space-x-2">
                <code className="px-3 py-2 bg-background border rounded font-mono text-lg">
                  {profile.referral_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralCode}
                >
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
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  PNG or JPEG, max 5MB
                </p>
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
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter unique username"
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

                  <div className="space-y-2">
                    <Label htmlFor="referral_code">Referral Code</Label>
                    <Input
                      id="referral_code"
                      value={profile.referral_code || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from username + birth year
                    </p>
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
              </CardContent>
            </Card>

            {/* Address Section */}
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

        <TabsContent value="kyc">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  KYC Compliance Status
                </CardTitle>
                <CardDescription>
                  Complete these fields to comply with Know Your Customer regulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={profile.kyc_status === 'approved' ? 'default' : 'secondary'}>
                      {profile.kyc_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                    <span className="font-medium">KYC Status</span>
                  </div>
                  {isKYCCompliant && profile.kyc_status === 'pending' && (
                    <Button onClick={handleSubmitKYC}>Submit for Review</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={profile.nationality || ''}
                      onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation *</Label>
                    <Input
                      id="occupation"
                      value={profile.occupation || ''}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer *</Label>
                    <Input
                      id="employer"
                      value={profile.employer || ''}
                      onChange={(e) => setProfile({ ...profile, employer: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annual_income_range">Annual Income Range *</Label>
                    <Select 
                      value={profile.annual_income_range || ''} 
                      onValueChange={(value) => setProfile({ ...profile, annual_income_range: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_25k">Under $25,000</SelectItem>
                        <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                        <SelectItem value="250k_500k">$250,000 - $500,000</SelectItem>
                        <SelectItem value="over_500k">Over $500,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source_of_funds">Source of Funds *</Label>
                    <Select 
                      value={profile.source_of_funds || ''} 
                      onValueChange={(value) => setProfile({ ...profile, source_of_funds: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source of funds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="inheritance">Inheritance</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trading_experience">Trading Experience *</Label>
                    <Select 
                      value={profile.trading_experience || ''} 
                      onValueChange={(value) => setProfile({ ...profile, trading_experience: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                        <SelectItem value="expert">Expert (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identification_type">ID Type *</Label>
                    <Select 
                      value={profile.identification_type || ''} 
                      onValueChange={(value) => setProfile({ ...profile, identification_type: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identification_number">ID Number *</Label>
                    <Input
                      id="identification_number"
                      value={profile.identification_number || ''}
                      onChange={(e) => setProfile({ ...profile, identification_number: e.target.value })}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identification_expiry">ID Expiry Date</Label>
                    <Input
                      id="identification_expiry"
                      type="date"
                      value={profile.identification_expiry || ''}
                      onChange={(e) => setProfile({ ...profile, identification_expiry: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Account Settings
                </CardTitle>
                <CardDescription>
                  Configure your payment accounts for deposits and withdrawals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stripe */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Stripe Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe_customer_id">Stripe Customer ID *</Label>
                      <Input
                        id="stripe_customer_id"
                        value={profile.stripe_customer_id || ''}
                        onChange={(e) => setProfile({ ...profile, stripe_customer_id: e.target.value })}
                        disabled={!isEditing}
                        placeholder="cus_..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stripe_account_id">Stripe Account ID *</Label>
                      <Input
                        id="stripe_account_id"
                        value={profile.stripe_account_id || ''}
                        onChange={(e) => setProfile({ ...profile, stripe_account_id: e.target.value })}
                        disabled={!isEditing}
                        placeholder="acct_..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* AirTM */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AirTM Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="airtm_email">AirTM Email *</Label>
                      <Input
                        id="airtm_email"
                        type="email"
                        value={profile.airtm_email || ''}
                        onChange={(e) => setProfile({ ...profile, airtm_email: e.target.value })}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="airtm_username">AirTM Username *</Label>
                      <Input
                        id="airtm_username"
                        value={profile.airtm_username || ''}
                        onChange={(e) => setProfile({ ...profile, airtm_username: e.target.value })}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Wise */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Wise Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wise_account_id">Wise Account ID *</Label>
                      <Input
                        id="wise_account_id"
                        value={profile.wise_account_id || ''}
                        onChange={(e) => setProfile({ ...profile, wise_account_id: e.target.value })}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wise_email">Wise Email *</Label>
                      <Input
                        id="wise_email"
                        type="email"
                        value={profile.wise_email || ''}
                        onChange={(e) => setProfile({ ...profile, wise_email: e.target.value })}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Invite Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                    WhatsApp Invite Settings
                  </h3>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">WhatsApp Integration</h4>
                          <p className="text-sm text-muted-foreground">
                            Use your WhatsApp number to invite friends and share your referral code
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {profile.whatsapp_number ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                      
                      {profile.whatsapp_number && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={shareViaWhatsApp}
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Test WhatsApp Share
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={inviteViaWhatsApp}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Share className="h-4 w-4 mr-2" />
                            Invite Friends
                          </Button>
                        </div>
                      )}
                      
                      {!profile.whatsapp_number && (
                        <p className="text-sm text-amber-600">
                          ⚠️ Please add your WhatsApp number in the Personal Information section to enable invite features
                        </p>
                      )}
                    </div>
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
                <p className="text-xs text-muted-foreground">All time</p>
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
                <p className="text-xs text-muted-foreground">Success rate</p>
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
                <p className="text-xs text-muted-foreground">All time profit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeStrategies}</div>
                <p className="text-xs text-muted-foreground">Currently following</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share className="h-5 w-5 mr-2" />
                Referral Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$0</div>
                  <p className="text-sm text-muted-foreground">Referral Earnings</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How to Earn More Referral Rewards:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Share your referral code: <code className="bg-background px-1 rounded">{profile.referral_code}</code></li>
                  <li>• Use the WhatsApp share feature to invite friends directly</li>
                  <li>• Earn commission on your referrals' trading activities</li>
                  <li>• Get bonuses when your referrals complete KYC verification</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
