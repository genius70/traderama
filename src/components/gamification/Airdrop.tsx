import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Gift, Star, CheckCircle } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import CreditsOverview from './airdrop/CreditsOverview';
import MilestoneProgress from './airdrop/MilestoneProgress';
import AirdropClaimForm from './airdrop/AirdropClaimForm';
import UserMilestoneBadges from './airdrop/UserMilestoneBadges';
import HowToEarnSection from './airdrop/HowToEarnSection';
import AirdropDistributionTemplate from "./airdrop/AirdropDistributionTemplate";

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

type UserProfile = {
  id: string;
  role: string;
  [key: string]: unknown;
};

// Type for database row with unknown structure
type DatabaseMilestone = {
  id: unknown;
  name: unknown;
  kem_bonus: unknown;
  created_at?: unknown;
};

type DatabaseUserMilestone = {
  milestone_id: unknown;
  user_id: unknown;
};

// Fixed type guards with proper return types
const isValidMilestone = (milestone: unknown): milestone is AirdropMilestoneRow => {
  return (
    milestone !== null &&
    typeof milestone === 'object' &&
    'id' in milestone &&
    'name' in milestone &&
    'kem_bonus' in milestone &&
    (typeof (milestone as unknown).id === 'string' || typeof (milestone as unknown).id === 'number') &&
    typeof (milestone as unknown).name === 'string' &&
    typeof (milestone as unknown).kem_bonus === 'number'
  );
};

const isValidUserMilestone = (milestone: unknown): milestone is UserMilestoneRow => {
  return (
    milestone !== null &&
    typeof milestone === 'object' &&
    'milestone_id' in milestone &&
    'user_id' in milestone &&
    (typeof (milestone as unknown).milestone_id === 'string' || typeof (milestone as unknown).milestone_id === 'number') &&
    typeof (milestone as unknown).user_id === 'string'
  );
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchKemCredits = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) fetchKemCredits();
  }, [user, fetchKemCredits]);

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const milestoneProgress = kemCredits ? (kemCredits.credits_earned % 100) : 0;
  const nextMilestone = kemCredits ? Math.ceil(kemCredits.credits_earned / 100) * 100 : 100;

  const fetchMilestones = useCallback(async () => {
    const { data, error } = await supabase
      .from("airdrop_milestones")
      .select("*")
      .order("created_at");

    if (error) {
      toast({
        title: "Error fetching milestones",
        description: error.message,
        variant: "destructive",
      });
      setMilestones([]);
      return;
    }

    if (!data || !Array.isArray(data)) {
      setMilestones([]);
      return;
    }
    
    // Transform the data to match our expected type with proper type checking
    const validMilestones = data
      .filter(isValidMilestone)
      .map(milestone => ({
        id: milestone.id,
        name: String(milestone.name),
        kem_bonus: Number(milestone.kem_bonus),
        created_at: milestone.created_at ? String(milestone.created_at) : undefined
      }));
    
    setMilestones(validMilestones);
  }, [toast]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setProfile(data as UserProfile);
    }
  }, [user]);

  const fetchUserMilestones = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_milestones")
      .select("milestone_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching user milestones:", error);
      setUserMilestones([]);
      return;
    }

    if (!data || !Array.isArray(data)) {
      setUserMilestones([]);
      return;
    }

    const milestoneIds = data
      .filter(isValidUserMilestone)
      .map(item => item.milestone_id);
    
    setUserMilestones(milestoneIds);
  }, [user]);

  useEffect(() => {
    fetchMilestones();
    fetchProfile();
    fetchUserMilestones();
  }, [fetchMilestones, fetchProfile, fetchUserMilestones]);

  const isAdmin = (profile?.role === "admin" || profile?.role === "super_admin");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2 ml-2">
          <Gift className="h-6 w-6 text-purple-600" />
          KEM Token Airdrop
        </h1>
      </div>

      {/* Show new admin airdrop template for admins only */}
      {isAdmin && <AirdropDistributionTemplate />}

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
