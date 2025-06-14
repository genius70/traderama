
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  ethereumWallet: string;
  setEthereumWallet: (v: string) => void;
  claimDisabled: boolean;
  onClaim: () => void;
  loading: boolean;
  kemAmount: number;
  availableCredits: number;
}

const AirdropClaimForm: React.FC<Props> = ({
  ethereumWallet,
  setEthereumWallet,
  claimDisabled,
  onClaim,
  loading,
  kemAmount,
  availableCredits,
}) => (
  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
    <h3 className="font-semibold text-purple-800">Claim Your KEM Tokens</h3>
    <p className="text-sm text-purple-600">
      You can claim {kemAmount} KEM tokens (5% of your {availableCredits} available credits)
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
      onClick={onClaim}
      disabled={claimDisabled}
      className="w-full bg-purple-600 hover:bg-purple-700"
    >
      {loading ? "Processing..." : `Claim ${kemAmount} KEM Tokens`}
    </Button>
  </div>
);

export default AirdropClaimForm;
