import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { User, Mail, Save, Trophy, Target, TrendingUp, MapPin, CreditCard, Shield, AlertCircle, Camera, Copy, Check, Share, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  username: string;
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

interface TabCompletionStatus {
  profile: boolean;
  kyc: boolean;
  payments: boolean;
  stats: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    activeStrategies: 0,
  });
  const [pendingChanges, setPendingChanges] = useState<Partial<Profile> | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 'profile', title: 'Personal Information' },
    { id: 'kyc', title: 'KYC & Compliance' },
    { id: 'payments', title: 'Payment Accounts' },
    { id: 'stats', title: 'Statistics' },
  ];

  // Load cached data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('profileData');
    const savedPendingChanges = localStorage.getItem('pendingChanges');

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...parsedProfile,
                referral_code: prev.referral_code || parsedProfile.referral_code, // Preserve existing referral_code
              }
            : parsedProfile
        );
      } catch (error) {
        console.error('Error loading saved profile data:', error);
      }
    }

    if (savedPendingChanges) {
      try {
        const parsedPendingChanges = JSON.parse(savedPendingChanges);
        setPendingChanges(parsedPendingChanges);
      } catch (error) {
        console.error('Error loading pending changes:', error);
      }
    }
  }, []);

  // Save profile to localStorage on change
  useEffect(() => {
    if (profile && isEditing) {
      const profileToSave = { ...profile, referral_code: profile.referral_code }; // Ensure referral_code is not overwritten
      localStorage.setItem('profileData', JSON.stringify(profileToSave));
      localStorage.setItem('pendingChanges', JSON.stringify(profileToSave));
    }
  }, [profile, isEditing]);

  // Generate a six-character referral code with exactly two digits
  const generateReferralCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    // Select 2 random positions for digits (0 to 5)
    const digitPositions: number[] = [];
    while (digitPositions.length < 2) {
      const pos = Math.floor(Math.random() * 6);
      if (!digitPositions.includes(pos)) {
        digitPositions.push(pos);
      }
    }
    // Generate code
    let code = '';
    for (let i = 0; i < 6; i++) {
      if (digitPositions.includes(i)) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
      } else {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
      }
    }
    return code; // e.g., "AB2C4D"
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

      // Check localStorage for existing referral_code
      const savedProfile = localStorage.getItem('profileData');
      let existingReferralCode = null;
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          existingReferralCode = parsedProfile.referral_code;
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      }

      const profileData = data
        ? {
            ...data,
            name: data.name || '',
            username: data.username || '',
            email: data.email || '',
            role: data.role || 'user',
            referral_code: data.referral_code || existingReferralCode || generateReferralCode(),
            created_at: data.created_at || new Date().toISOString(),
          }
        : null;
      setProfile(profileData);
      localStorage.setItem('profileData', JSON.stringify(profileData));
      localStorage.setItem('pendingChanges', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error loading profile',
        variant: 'destructive',
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
        totalPnL: 15420.5,
        activeStrategies: 3,
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

  // Check tab completion for progress calculation
  const checkTabCompletion = useCallback((): TabCompletionStatus => {
    const profileComplete = !!(
      profile?.name &&
      profile?.username &&
      profile?.phone_number &&
      profile?.whatsapp_number &&
      profile?.ethereum_wallet &&
      profile?.bio &&
      profile?.address_line1 &&
      profile?.city &&
      profile?.state_province &&
      profile?.postal_code &&
      profile?.country &&
      profile?.referral_code
    );

    const kycComplete = !!(
      profile?.nationality &&
      profile?.occupation &&
      profile?.employer &&
      profile?.annual_income_range &&
      profile?.source_of_funds &&
      profile?.trading_experience &&
      profile?.identification_type &&
      profile?.identification_number
    );

    const paymentsComplete = !!(
      profile?.stripe_customer_id &&
      profile?.stripe_account_id &&
      profile?.airtm_email &&
      profile?.airtm_username &&
      profile?.wise_account_id &&
      profile?.wise_email
    );

    return {
      profile: profileComplete,
      kyc: kycComplete,
      payments: paymentsComplete,
      stats: true,
    };
  }, [profile]);

  // Update profile completion percentage
  useEffect(() => {
    if (!profile) return;
    const completion = checkTabCompletion();
    const totalSteps = 3; // profile, kyc, payments
    const completedSteps = [completion.profile, completion.kyc, completion.payments].filter(Boolean).length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    setProfile((prev) =>
      prev ? { ...prev, profile_completion_percentage: percentage } : null
    );
  }, [profile, checkTabCompletion]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !profile) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          variant: 'destructive',
        });
      return;
    }

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedProfile = { ...profile, profile_image_url: data.publicUrl };
      setProfile(updatedProfile);
      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
      toast({
        title: 'Avatar updated successfully',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      let updatedProfile = { ...profile };
      // Only generate referral_code if it doesn't exist in profile or localStorage
      const savedProfile = localStorage.getItem('profileData');
      let existingReferralCode = profile.referral_code;
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          existingReferralCode = parsedProfile.referral_code || existingReferralCode;
        } catch (e) {
          console.error('Error parsing saved profile:', e);
        }
      }
      if (!existingReferralCode) {
        const newReferralCode = generateReferralCode();
        updatedProfile = { ...profile, referral_code: newReferralCode };
        setProfile(updatedProfile);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          phone_number: updatedProfile.phone_number,
          whatsapp_number: updatedProfile.whatsapp_number,
          ethereum_wallet: updatedProfile.ethereum_wallet,
          address_line1: updatedProfile.address_line1,
          address_line2: updatedProfile.address_line2,
          city: updatedProfile.city,
          state_province: updatedProfile.state_province,
          postal_code: updatedProfile.postal_code,
          country: updatedProfile.country,
          nationality: updatedProfile.nationality,
          occupation: updatedProfile.occupation,
          employer: updatedProfile.employer,
          annual_income_range: updatedProfile.annual_income_range,
          source_of_funds: updatedProfile.source_of_funds,
          trading_experience: updatedProfile.trading_experience,
          risk_tolerance: updatedProfile.risk_tolerance,
          identification_type: updatedProfile.identification_type,
          identification_number: updatedProfile.identification_number,
          identification_expiry: updatedProfile.identification_expiry,
          stripe_customer_id: updatedProfile.stripe_customer_id,
          stripe_account_id: updatedProfile.stripe_account_id,
          airtm_email: updatedProfile.airtm_email,
          airtm_username: updatedProfile.airtm_username,
          wise_account_id: updatedProfile.wise_account_id,
          wise_email: updatedProfile.wise_email,
          profile_completion_percentage: updatedProfile.profile_completion_percentage,
          ...(profile.role === 'admin' ? { kyc_status: updatedProfile.kyc_status } : {}),
          // Note: referral_code is NOT updated to prevent changes after initial entry
        })
        .eq('id', user.id);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Username already exists',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
      localStorage.removeItem('pendingChanges');
      toast({
        title: 'Profile updated successfully',
      });
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Failed to update profile',
        variant: 'destructive',
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
        title: 'KYC submission successful',
      });
      await fetchProfile();
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Failed to submit KYC',
        variant: 'destructive',
      });
    }
  };

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;

    try {
      await navigator.clipboard.writeText(`https://www.traderama.pro/?ref_id=${profile.referral_code}`);
      setCopiedReferral(true);
      toast({
        title: 'Referral link copied!',
      });
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy referral link',
        variant: 'destructive',
      });
    }
  };

  const inviteViaWhatsApp = async () => {
    if (!profile?.referral_code) return;

    try {
      const referralUrl = `https://www.traderama.pro/?ref_id=${profile.referral_code}`;
      const message = encodeURIComponent(
        `🚀 Hey! I'm using Traderama, an awesome trading platform. Join using my referral link: ${referralUrl} to get exclusive benefits!`
      );
      const whatsappUrl = `https://wa.me/?text=${message}`;

      // Note: referral_logs table doesn't exist, using notifications instead
      await supabase.from('notifications').insert({
        sender_id: user?.id,
        title: 'WhatsApp Referral Invite',
        content: `Referral invite sent via WhatsApp: ${profile.referral_code}`,
        notification_type: 'referral',
      });

      window.open(whatsappUrl, '_blank');
      toast({
        title: 'Invite sent',
      });
    } catch (error) {
      console.error('Error logging WhatsApp invite:', error);
      toast({
        title: 'Failed to send invite',
        variant: 'destructive',
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isAdmin = profile?.role === 'admin';

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
                {completionPercentage < 100 ? (
                  <AlertCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <Shield className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle>Profile Completion: {completionPercentage}%</CardTitle>
                <CardDescription>
                  {completionPercentage < 100
                    ? 'Complete your profile to comply with KYC requirements and access all features'
                    : 'Your profile is complete and KYC compliant'}
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
          <Progress value={completionPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={currentStep === index ? 'default' : 'outline'}
                  onClick={() => setCurrentStep(index)}
                  className="flex-1"
                >
                  {step.title}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

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
                <Button variant="outline" size="sm" onClick={copyReferralCode}>
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

      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {profile.username?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
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
                  title="Upload your avatar image"
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
                <p className="text-xs text-muted-foreground">PNG or JPEG, max 5MB</p>
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, name: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={profile.username || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, username: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, phone_number: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, whatsapp_number: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, ethereum_wallet: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referral_code">Referral Code *</Label>
                    <Input
                      id="referral_code"
                      value={profile.referral_code || ''}
                      disabled
                      className="bg-muted"
                      placeholder="Auto-generated on save"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => {
                      const updatedProfile = { ...profile, bio: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    required
                  />
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, address_line1: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={profile.address_line2 || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, address_line2: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, city: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state_province">State/Province *</Label>
                    <Input
                      id="state_province"
                      value={profile.state_province || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, state_province: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={profile.postal_code || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, postal_code: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={profile.country || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, country: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {currentStep === 1 && (
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
                    onChange={(e) => {
                      const updatedProfile = { ...profile, nationality: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation || ''}
                    onChange={(e) => {
                      const updatedProfile = { ...profile, occupation: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer">Employer *</Label>
                  <Input
                    id="employer"
                    value={profile.employer || ''}
                    onChange={(e) => {
                      const updatedProfile = { ...profile, employer: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_income_range">Annual Income Range *</Label>
                  <Select
                    value={profile.annual_income_range || ''}
                    onValueChange={(value) => {
                      const updatedProfile = { ...profile, annual_income_range: value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
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
                    onValueChange={(value) => {
                      const updatedProfile = { ...profile, source_of_funds: value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
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
                    onValueChange={(value) => {
                      const updatedProfile = { ...profile, trading_experience: value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
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
                    onValueChange={(value) => {
                      const updatedProfile = { ...profile, identification_type: value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
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
                    onChange={(e) => {
                      const updatedProfile = { ...profile, identification_number: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identification_expiry">ID Expiry Date</Label>
                  <Input
                    id="identification_expiry"
                    value={profile.identification_expiry || ''}
                    onChange={(e) => {
                      const updatedProfile = { ...profile, identification_expiry: e.target.value };
                      setProfile(updatedProfile);
                      localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                    }}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Account Settings
              </CardTitle>
              <CardDescription>Configure your payment accounts for deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stripe Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe_customer_id">Stripe Customer ID *</Label>
                    <Input
                      id="stripe_customer_id"
                      value={profile.stripe_customer_id || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, stripe_customer_id: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, stripe_account_id: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      placeholder="acct_..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AirTM Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="airtm_email">AirTM Email *</Label>
                    <Input
                      id="airtm_email"
                      type="email"
                      value={profile.airtm_email || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, airtm_email: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airtm_username">AirTM Username *</Label>
                    <Input
                      id="airtm_username"
                      value={profile.airtm_username || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, airtm_username: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Wise Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wise_account_id">Wise Account ID *</Label>
                    <Input
                      id="wise_account_id"
                      value={profile.wise_account_id || ''}
                      onChange={(e) => {
                        const updatedProfile = { ...profile, wise_account_id: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
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
                      onChange={(e) => {
                        const updatedProfile = { ...profile, wise_email: e.target.value };
                        setProfile(updatedProfile);
                        localStorage.setItem('profileData', JSON.stringify(updatedProfile));
                      }}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </div>

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
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
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
                <div className="text-2xl font-bold text-green-600">${stats.totalPnL.toLocaleString()}</div>
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
                  <li>
                    • Share your referral link: <a href={`https://www.traderama.pro/?ref_id=${profile.referral_code}`} className="text-blue-600 hover:underline">{`https://www.traderama.pro/?ref_id=${profile.referral_code}`}</a>
                  </li>
                  <li>• Use the WhatsApp share feature to invite friends directly</li>
                  <li>• Earn commission on your referrals' trading activities</li>
                  <li>• Get bonuses when your referrals complete KYC verification</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0 || saving}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={saving || (currentStep < 2 && !isEditing)}
          >
            {currentStep === steps.length - 1 ? 'Save Profile' : 'Next'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
