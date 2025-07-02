import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string | number;
  content?: string;
  author?: string;
  created_at?: string;
  [key: string]: unknown; // Allow for other post properties
}

interface TipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

const TIP_AMOUNTS = [
  { label: "☕ Buy me a coffee", amount: 5 },
  { label: "🌹 Buy me a rose", amount: 10 },
  { label: "🪙 Send me a gold coin", amount: 25 },
];

export default function TipModal({ open, onOpenChange, post }: TipModalProps) {
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Placeholder: Integrate Stripe/checkout for tips
  async function handleTip() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast({
        title: "Thank you for your tip!",
        description: `You've sent ${TIP_AMOUNTS[selected].label}!`,
      });
    }, 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Crown className="inline w-5 h-5 text-yellow-500 mb-1 mr-2" />
            Send a Tip to the Creator
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-3 pb-1">
          {TIP_AMOUNTS.map((tip, idx) => (
            <Button
              key={tip.amount}
              variant={selected === idx ? "default" : "outline"}
              className="flex items-center justify-between"
              onClick={() => setSelected(idx)}
              disabled={loading}
            >
              <span>{tip.label}</span>
              <span className="ml-4 text-xs text-gray-500">${tip.amount}</span>
            </Button>
          ))}
        </div>
        <Button
          className="w-full mt-4"
          onClick={handleTip}
          disabled={loading}
        >
          {loading ? "Processing tip..." : "Send Tip"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
