
import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Send, Upload } from "lucide-react";
import Papa from "papaparse";

// Step 1: UI state types
type DistributionEntry = {
  email: string;
  wallet: string;
  kemAmount: number;
  status?: "pending" | "sent" | "error";
  errorMsg?: string;
};

type UserProfile = {
  id: string;
  role: string;
  [key: string]: unknown;
};

// Type for CSV row data
type CsvRowData = {
  email?: string;
  wallet?: string;
  kemAmount?: string | number;
  [key: string]: unknown;
};

const AirdropDistributionTemplate: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DistributionEntry[]>([
    { email: "", wallet: "", kemAmount: 0, status: "pending" }
  ]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only admins and super_admins may view this!
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setProfile(data as UserProfile);
    }
  }, [user]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  if (!isAdmin) return null;

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedEntries: DistributionEntry[] = (results.data as CsvRowData[])
            .map((row) => ({
              email: row.email || "",
              wallet: row.wallet || "",
              kemAmount: Number(row.kemAmount) || 0,
              status: "pending" as const,
            }))
            .filter(entry => entry.wallet && entry.kemAmount > 0);

          if (parsedEntries.length > 0) {
            setEntries(parsedEntries);
            toast({ title: "CSV Imported" });
          } else {
            toast({ title: "CSV Import Failed", variant: "destructive" });
          }
        },
        error: (error: Error) => {
          toast({ title: "CSV Parsing Error", variant: "destructive" });
        },
      });
      // Reset file input
      if(event.target) event.target.value = '';
    }
  };

  const handleDistribute = async () => {
    setProcessing(true);

    const validatedEntries: DistributionEntry[] = entries.map(entry => {
        if (!entry.wallet || !/^0x[a-fA-F0-9]{40}$/.test(entry.wallet)) {
            return { ...entry, status: "error", errorMsg: "Invalid wallet address" };
        }
        if (entry.kemAmount <= 0) {
            return { ...entry, status: "error", errorMsg: "KEM amount must be > 0" };
        }
        return { ...entry, status: "pending", errorMsg: undefined };
    });

    setEntries(validatedEntries);

    const entriesToSubmit = validatedEntries.filter(e => e.status === 'pending');

    if (entriesToSubmit.length === 0) {
        toast({ title: "No valid entries to submit", variant: "destructive" });
        setProcessing(false);
        return;
    }

    const airdropRecords = entriesToSubmit.map(entry => ({
        ethereum_wallet: entry.wallet,
        kem_amount: entry.kemAmount,
        credits_used: 0, // Manual airdrop
        status: 'pending'
    }));

    const { error } = await supabase.from('airdrops').insert(airdropRecords);

    if (error) {
        toast({ title: "Error saving airdrop requests", variant: "destructive" });
        const errorEntries = validatedEntries.map(e => entriesToSubmit.some(s => s.wallet === e.wallet) ? {...e, status: 'error' as const, errorMsg: 'DB write failed'} : e);
        setEntries(errorEntries);
    } else {
        toast({ title: "Airdrop distribution queued!" });
        const sentEntries = validatedEntries.map(e => entriesToSubmit.some(s => s.wallet === e.wallet) ? {...e, status: 'sent' as const} : e);
        setEntries(sentEntries);
    }

    setProcessing(false);
  };

  const handleEntryChange = (idx: number, field: keyof DistributionEntry, value: string | number) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const handleAddRow = () => setEntries([...entries, { email: "", wallet: "", kemAmount: 0, status: 'pending' }]);
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
          <span>Enter wallet addresses and amounts to distribute KEM tokens, or import from a CSV file.</span>
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
                  <td className="p-2 w-32">
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
                        Queued
                      </Badge>
                    )}
                    {entry.status === "pending" && <Badge variant="outline">Pending</Badge>}
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
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={processing}>
            <Upload className="mr-2 w-4 h-4" />
            Import CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleCsvUpload}
          />
          <Button
            onClick={handleDistribute}
            className="ml-auto"
            disabled={processing || entries.length === 0}
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
