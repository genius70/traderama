import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Wallet, TrendingUp, Gift } from 'lucide-react';
import AdminAirdropPanel from "./AdminAirdropPanel";

interface KemCredits {
  credits_earned: number;
  credits_spent: number;
  total_airdrops_received: number;
}

const Airdrop: React.FC = () => {
  const [ethereumWallet, setEthereumWallet] = useState('');
  const [kemCredits, setKemCredits] = useState<KemCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableCredits, setAvailableCredits] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState([]);
  const [userMilestones, setUserMilestones] = useState([]);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      fetchKemCredits();
    }
  }, [user]);

  const fetchKemCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('kem_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching KEM credits:', error);
      return;
    }

    if (data) {
      setKemCredits(data);
      setAvailableCredits(data.credits_earned - data.credits_spent);
    } else {
      // Initialize KEM credits if not found
      const { data: newCredits, error: insertError } = await supabase
        .from('kem_credits')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (!insertError && newCredits) {
        setKemCredits(newCredits);
        setAvailableCredits(0);
      }
    }
  };

  const calculateKemTokens = (credits: number) => {
    return credits * 0.05; // 5% of credits earned in KEM tokens
  };

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

      // Update spent credits
      const { error: updateError } = await supabase
        .from('kem_credits')
        .update({ 
          credits_spent: (kemCredits?.credits_spent || 0) + availableCredits,
          total_airdrops_received: (kemCredits?.total_airdrops_received || 0) + kemAmount
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Airdrop Request Submitted!",
        description: `${kemAmount} KEM tokens will be sent to your wallet within 24 hours.`,
      });

      // Refresh credits
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
      .from<AirdropMilestoneRow>("airdrop_milestones" as any)
      .select("*")
      .order("created_at");
    setMilestones(data || []);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data);
  };

  const fetchUserMilestones = async () => {
    if (!user) return;
    const { data } = await supabase
      .from<UserMilestoneRow>("user_milestones" as any)
      .select("milestone_id")
      .eq("user_id", user.id);
    setUserMilestones((data || []).map((um: UserMilestoneRow) => um.milestone_id));
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
          {/* Credits Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {kemCredits?.credits_earned || 0}
                </div>
                <div className="text-sm text-green-600">Total Credits Earned</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {availableCredits}
                </div>
                <div className="text-sm text-blue-600">Available Credits</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {kemCredits?.total_airdrops_received || 0}
                </div>
                <div className="text-sm text-purple-600">KEM Tokens Received</div>
              </CardContent>
            </Card>
          </div>

          {/* Milestone Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Milestone Progress</Label>
              <Badge variant="outline">
                {kemCredits?.credits_earned || 0} / {nextMilestone} credits
              </Badge>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
            <p className="text-sm text-gray-500">
              Earn {nextMilestone - (kemCredits?.credits_earned || 0)} more credits to reach the next milestone
            </p>
          </div>

          {/* Airdrop Form */}
          {availableCredits > 0 && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800">Claim Your KEM Tokens</h3>
              <p className="text-sm text-purple-600">
                You can claim {calculateKemTokens(availableCredits)} KEM tokens (5% of your {availableCredits} available credits)
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="ethereum-wallet">Ethereum Wallet Address</Label>
                <Input
                  id="ethereum-wallet"
                  value={ethereumWallet}
                  onChange={(e) => setEthereumWallet(e.target.value)}
                  placeholder="0x..."
                  pattern="^0x[a-fA-F0-9]{40}$"
                />
              </div>
              
              <Button 
                onClick={handleAirdrop}
                disabled={loading || !ethereumWallet || !/^0x[a-fA-F0-9]{40}$/.test(ethereumWallet)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Processing...' : `Claim ${calculateKemTokens(availableCredits)} KEM Tokens`}
              </Button>
            </div>
          )}

          {availableCredits === 0 && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No credits available for airdrop</p>
              <p className="text-sm text-gray-400 mt-2">
                Earn credits by engaging with the community: like, share, comment, post, and invite friends!
              </p>
            </div>
          )}

          {/* How to Earn Credits */}
          <div className="space-y-2">
            <h3 className="font-semibold">How to Earn KEM Credits</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Like, share, comment, or post: 1 credit each</li>
              <li>• Friend accepts your invitation: 2 credits</li>
              <li>• Milestone airdrops: 5% of total credits earned</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      {/* User Milestone Badge Panel */}
      <Card className="my-4 bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle>
            <Gift className="h-5 w-5 text-purple-600 mr-1" />
            Your Milestone Achievements
          </CardTitle>
          <CardDescription>
            Earn badges and bonus KEM awards!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {milestones.map(m => (
              <Badge
                key={m.id}
                className={userMilestones.includes(m.id) ? "bg-green-600 text-white" : "bg-gray-200"}
              >
                {m.name}
                {m.kem_bonus > 0 && <span className="ml-1">+{m.kem_bonus} KEM</span>}
                {userMilestones.includes(m.id) && <span className="ml-2 text-xs">Complete</span>}
              </Badge>
            ))}
            {!milestones.length && <span className="text-gray-500">No milestones yet</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Airdrop;
