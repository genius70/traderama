import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, Building, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const paymentMethods = [
  { id: "stripe", name: "Stripe", icon: CreditCard, description: "Credit/Debit Cards" },
  { id: "airtm", name: "AirTM", icon: Building, description: "Digital Wallet" },
  { id: "wise", name: "Wise", icon: Banknote, description: "Bank Transfer" }
];

interface PremiumGroupCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckoutResponse {
  url?: string;
}

const PRODUCT_LABEL = "Premium Group Access";
const PRODUCT_AMOUNT = 5000; // $50.00 (in cents), match ProductOffers

export default function PremiumGroupCheckoutDialog({ open, onOpenChange }: PremiumGroupCheckoutDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleCheckout(paymentMethod: string) {
    setLoading(paymentMethod);
    try {
      if (paymentMethod === "stripe") {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            productName: PRODUCT_LABEL,
            amount: PRODUCT_AMOUNT,
            currency: "usd",
          }
        });
        if (error) throw error;
        
        const checkoutData = data as CheckoutResponse;
        if (checkoutData?.url) {
          window.open(checkoutData.url, "_blank");
          toast({
            title: "Redirecting to Stripe...",
            description: "Complete your payment in the new tab.",
          });
        }
      } else {
        // Placeholder for other methods
        toast({
          title: "Alternative Payment",
          description: `Payment provider (${paymentMethod}) is coming soon or handled manually.`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate payment.";
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setLoading(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Crown className="inline w-5 h-5 text-yellow-500 mb-1 mr-2" />
            Create Premium Group
          </DialogTitle>
          <DialogDescription>
            Unlock the ability to create exclusive premium trading groups for $50/month.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-xl font-bold">$50 <span className="text-base font-normal text-gray-500">/month</span></p>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.id}
                  variant="outline"
                  disabled={!!loading && loading === method.id}
                  className="w-full flex items-center justify-start gap-2"
                  onClick={() => handleCheckout(method.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{method.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{method.description}</span>
                  {loading === method.id && <span className="ml-4 text-sm">Processing...</span>}
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
