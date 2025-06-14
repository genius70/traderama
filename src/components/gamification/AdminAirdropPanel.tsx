import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Crown } from "lucide-react";

// Manual types for external/legacy tables
type KemSettings = {
  kem_conversion_rate: number;
  updated_at: string;
  [key: string]: any;
};
type AirdropMilestoneRow = {
  id: string | number;
  name: string;
  kem_bonus: number;
  created_at?: string;
};
type EligibleUserRow = {
  user_id: string;
  credits_earned: number;
  profiles: {
    name?: string;
    email?: string;
  };
};

const AdminAirdropPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversionRate, setConversionRate] = useState(0.05);
  const [milestones, setMilestones] = useState<AirdropMilestoneRow[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUserRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchMilestones();
    fetchEligible();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("kem_settings" as any)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      data &&
      typeof data === "object" &&
      typeof data.kem_conversion_rate === "number"
    ) {
      setConversionRate(data.kem_conversion_rate);
    }
  };

  const saveRate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("kem_settings" as any)
      .upsert({
        kem_conversion_rate: conversionRate,
        updated_at: new Date().toISOString(),
      });
    setLoading(false);
    if (!error) toast({ title: "Conversion rate saved" });
  };

  // Add a type guard for milestones
  const isMilestoneRow = (d: any): d is AirdropMilestoneRow => 
    d &&
    (typeof d.id === "string" || typeof d.id === "number") &&
    typeof d.name === "string" &&
    typeof d.kem_bonus === "number";

  const fetchMilestones = async () => {
    const { data } = await supabase
      .from("airdrop_milestones" as any)
      .select("*")
      .order("created_at");

    // Defensive: ensure array and filter
    if (Array.isArray(data)) {
      const filtered: AirdropMilestoneRow[] = data.filter(isMilestoneRow);
      setMilestones(filtered);
    } else {
      setMilestones([]);
    }
  };

  const fetchEligible = async () => {
    const { data } = await supabase
      .from("kem_credits")
      .select("user_id, credits_earned, profiles (name, email)")
      .gte("credits_earned", 100);
    setEligibleUsers(Array.isArray(data) ? data : []);
  };

  const handleAirdrop = async (recipient: EligibleUserRow) => {
    if (
      !window.confirm(
        `Send airdrop to ${recipient.profiles?.name || recipient.profiles?.email}?`
      )
    )
      return;
    setLoading(true);
    await supabase.from("airdrops").insert([
      {
        user_id: recipient.user_id,
        kem_amount: Math.floor(recipient.credits_earned * conversionRate * 100) / 100,
        credits_used: recipient.credits_earned,
        ethereum_wallet: null,
        status: "admin_distributed",
      },
    ]);
    setLoading(false);
    toast({ title: "Airdrop sent!" });
    fetchEligible();
  };

  return (
    <Card className="my-6 border-2 border-purple-300">
      <CardHeader>
        <CardTitle>
          <Crown className="inline w-5 h-5 text-yellow-500 mb-1 mr-2" />
          Admin KEM Airdrops Control
        </CardTitle>
        <CardDescription>
          Set conversion rate, manage milestones, and send KEM to eligible users (&gt; 100 credits)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6 items-center mb-4">
          <div>
            <label className="text-sm font-semibold mb-1 block">
              Credits → KEM Token Rate
            </label>
            <Input
              type="number"
              min={0.001}
              step={0.001}
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-32"
            />
            <Button onClick={saveRate} className="ml-2" disabled={loading}>
              Save
            </Button>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Milestones</label>
            <div className="flex flex-col gap-1">
              {milestones.map((m) => (
                <Badge key={m.id} className="mb-1">
                  {m.name} ({m.kem_bonus} KEM)
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Eligible Users</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Credits</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleUsers.length > 0 ? (
                  eligibleUsers.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.profiles?.name || u.profiles?.email}</td>
                      <td>{u.credits_earned}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAirdrop(u)}
                          disabled={loading}
                        >
                          Airdrop
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-gray-500">
                      No eligible users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAirdropPanel;
