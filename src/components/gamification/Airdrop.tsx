
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Gift } from 'lucide-react';
import AdminAirdropPanel from "./AdminAirdropPanel";
import CreditsOverview from './airdrop/CreditsOverview';
import MilestoneProgress from './airdrop/MilestoneProgress';
import AirdropClaimForm from './airdrop/AirdropClaimForm';
import UserMilestoneBadges from './airdrop/UserMilestoneBadges';
import HowToEarnSection from './airdrop/HowToEarnSection';

// Manual types
type KemCredits = {
  credits_earned: number;
  credits_spent: number;
  total_airdrops_received: number;
};
type AirdropMilestoneRow = {
  id: string | number;
  name: string;
  kem_bonus: number;
  created_at?: string;
};
type UserMilestoneRow = {
  milestone_id: string | number;
  user_id: string;
};

const Airdrop: React.FC = () => {
  const [ethereumWallet, setEthereumWallet] = useState('');
  const [kemCredits, setKemCredits] = useState<KemCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<AirdropMilestoneRow[]>([]);
  const [userMilestones, setUserMilestones] = useState<(string | number)[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (user) fetchKemCredits();
  }, [user]);

  const fetchKemCredits = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('kem_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) return;
    if (data) {
      setKemCredits(data);
      setAvailableCredits(data.credits_earned - data.credits_spent);
    } else {
      const { data: newCredits } = await supabase
        .from('kem_credits')
        .insert([{ user_id: user.id }])
        .select()
        .maybeSingle();
      if (newCredits) {
        setKemCredits(newCredits);
        setAvailableCredits(0);
      }
    }
  };

  const calculateKemTokens = (credits: number) => Math.floor(credits * 0.05 * 100) / 100;

  const handleAirdrop = async () => {
    if (!user || !ethereumWallet || availableCredits === 0) return;
    setLoading(true);
    try {
      const kemAmount = calculateKemTokens(availableCredits);
      const { error } = await supabase
        .from('airdrops')
        .insert([{
          user_id: user.id,
          ethereum_wallet: ethereumWallet,
          kem_amount: kemAmount,
          credits_used: availableCredits,
          status: 'pending'
        }]);
      if (error) throw error;
      await supabase
        .from('kem_credits')
        .update({
          credits_spent: (kemCredits?.credits_spent || 0) + availableCredits,
          total_airdrops_received: (kemCredits?.total_airdrops_received || 0) + kemAmount
        })
        .eq('user_id', user.id);
      toast({
        title: "Airdrop Request Submitted!",
        description: `${kemAmount} KEM tokens will be sent to your wallet within 24 hours.`,
      });
      await fetchKemCredits();
      setEthereumWallet('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const milestoneProgress = kemCredits ? (kemCredits.credits_earned % 100) : 0;
  const nextMilestone = kemCredits ? Math.ceil(kemCredits.credits_earned / 100) * 100 : 100;

  useEffect(() => {
    fetchMilestones();
    fetchProfile();
    fetchUserMilestones();
  }, [user]);

  const fetchMilestones = async () => {
    const { data } = await supabase
      .from('airdrop_milestones')
      .select("*")
      .order("created_at");
    setMilestones(Array.isArray(data) ? data : []);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data);
  };

  const fetchUserMilestones = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_milestones')
      .select("milestone_id")
      .eq("user_id", user.id);
    setUserMilestones(
      Array.isArray(data)
        ? (data as { milestone_id: string | number }[]).map((um) => um.milestone_id)
        : []
    );
  };

  const isAdmin = (profile?.role === "admin" || profile?.role === "super_admin");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isAdmin && <AdminAirdropPanel />}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-purple-600" />
            <span>KEM Token Airdrop</span>
          </CardTitle>
          <CardDescription>
            Claim your KEM tokens based on earned credits from community activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreditsOverview
            earned={kemCredits?.credits_earned || 0}
            available={availableCredits}
            received={kemCredits?.total_airdrops_received || 0}
          />

          <MilestoneProgress
            creditsEarned={kemCredits?.credits_earned || 0}
            nextMilestone={nextMilestone}
            progressValue={milestoneProgress}
          />

          {availableCredits > 0 ? (
            <AirdropClaimForm
              ethereumWallet={ethereumWallet}
              setEthereumWallet={setEthereumWallet}
              claimDisabled={loading || !ethereumWallet || !/^0x[a-fA-F0-9]{40}$/.test(ethereumWallet)}
              onClaim={handleAirdrop}
              loading={loading}
              kemAmount={calculateKemTokens(availableCredits)}
              availableCredits={availableCredits}
            />
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No credits available for airdrop</p>
              <p className="text-sm text-gray-400 mt-2">
                Earn credits by engaging with the community: like, share, comment, post, and invite friends!
              </p>
            </div>
          )}

          <HowToEarnSection />
        </CardContent>
      </Card>

      <UserMilestoneBadges milestones={milestones} userMilestones={userMilestones} />
    </div>
  );
};

export default Airdrop;

// The file is now modular. Consider refactoring again if it gets too long.
