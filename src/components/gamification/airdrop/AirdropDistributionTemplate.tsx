
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Send } from "lucide-react";

// Step 1: UI state types
type DistributionEntry = {
  email: string;
  wallet: string;
  kemAmount: number;
  status?: "pending" | "sent" | "error";
  errorMsg?: string;
};

const AirdropDistributionTemplate: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DistributionEntry[]>([
    { email: "", wallet: "", kemAmount: 0 }
  ]);
  const [processing, setProcessing] = useState(false);

  // Only admins and super_admins may view this!
  const [profile, setProfile] = useState<any | null>(null);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  if (!isAdmin) return null;

  // Step 2: Distribution logic (stub)
  const handleDistribute = async () => {
    setProcessing(true);

    // Simulate distribution for now: implement real logic as needed!
    const updated = await Promise.all(
      entries.map(async (entry) => {
        // Optional: Validate wallet address, etc.
        if (!entry.wallet || !/^0x[a-fA-F0-9]{40}$/.test(entry.wallet)) {
          return { ...entry, status: "error", errorMsg: "Invalid wallet address" };
        }
        if (entry.kemAmount <= 0) {
          return { ...entry, status: "error", errorMsg: "KEM amount must be > 0" };
        }
        // TODO: Implement actual token transfer logic here
        // Simulate async result
        await new Promise((r) => setTimeout(r, 500));
        return { ...entry, status: "sent" };
      })
    );
    setEntries(updated);
    setProcessing(false);

    // Any errors?
    if (updated.some((e) => e.status === "error")) {
      toast({ title: "Some distributions failed", variant: "destructive" });
    } else {
      toast({ title: "Airdrop distributed!" });
    }
  };

  // Step 3: Entry management
  const handleEntryChange = (idx: number, field: keyof DistributionEntry, value: string | number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const handleAddRow = () => setEntries([...entries, { email: "", wallet: "", kemAmount: 0 }]);
  const handleRemoveRow = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Card className="my-6 border-2 border-amber-400">
      <CardHeader>
        <CardTitle>
          <UserPlus className="inline w-5 h-5 text-amber-500 mb-1 mr-2" />
          KEM Airdrop Distribution (Admin Only)
        </CardTitle>
        <CardDescription>
          <span>Enter wallet addresses and amounts to distribute KEM tokens.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border">
            <thead>
              <tr>
                <th className="p-2">Recipient Email (optional)</th>
                <th className="p-2">Wallet Address</th>
                <th className="p-2">KEM Amount</th>
                <th className="p-2"></th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="p-2">
                    <Input
                      value={entry.email}
                      placeholder="recipient@email.com"
                      disabled={processing}
                      onChange={(e) => handleEntryChange(idx, "email", e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={entry.wallet}
                      placeholder="0x... wallet"
                      disabled={processing}
                      onChange={(e) => handleEntryChange(idx, "wallet", e.target.value)}
                    />
                  </td>
                  <td className="p-2 w-24">
                    <Input
                      type="number"
                      min={0}
                      value={entry.kemAmount}
                      disabled={processing}
                      onChange={(e) => handleEntryChange(idx, "kemAmount", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-2">
                    {entries.length > 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={processing}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                  <td className="p-2">
                    {entry.status === "sent" && (
                      <Badge variant="default" className="bg-green-200 text-green-700">
                        Sent
                      </Badge>
                    )}
                    {entry.status === "pending" && <span>Pending...</span>}
                    {entry.status === "error" && (
                      <Badge variant="destructive">{entry.errorMsg || "Error"}</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddRow} variant="outline" disabled={processing}>
            Add Recipient
          </Button>
          <Button
            onClick={handleDistribute}
            className="ml-auto"
            disabled={processing}
          >
            <Send className="mr-2 w-4 h-4" />
            Distribute Airdrop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirdropDistributionTemplate;
