
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ManualPaymentModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  provider: "AirTM" | "Wise";
}

export default function ManualPaymentModal({ open, onOpenChange, provider }: ManualPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider} Manual Payment</DialogTitle>
          <DialogDescription>
            Please contact platform support to complete your payment via {provider}.<br />
            After sending funds, upload your proof of payment. The admin team will check and activate your subscription/group access manually.<br />
            <span className="mt-2 block text-xs text-gray-500">Automated {provider} payments coming soon!</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <p className="text-sm text-gray-700">
            1. Send payment to the official {provider} account.<br />
            2. Save your transaction receipt/proof.<br />
            3. Email <span className="font-semibold">support@traderama.com</span> with your details.<br />
            4. Our team will review and confirm your activation within 24h.
          </p>
          <Button className="w-full mt-4" onClick={() => onOpenChange(false)}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
