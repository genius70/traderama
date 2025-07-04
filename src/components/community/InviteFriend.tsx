import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const InviteFriend = () => {
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      setReferralLink(`${window.location.origin}/register?ref=${user.id}`);
    }
  }, [user]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Traderama!",
          text: "Sign up using my referral link and start trading!",
          url: referralLink,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    } else {
      toast({
        title: "Web Share API not supported",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Referral link copied!",
    });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=Join Traderama!&body=Sign up using my referral link: ${referralLink}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Friends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Share your referral link with friends and earn rewards!
        </p>
        <div className="space-y-2">
          <Label htmlFor="referral-link">Referral Link</Label>
          <div className="flex rounded-md shadow-sm">
            <Input
              id="referral-link"
              className="bg-gray-100 cursor-not-allowed"
              value={referralLink}
              disabled
            />
            <Button
              onClick={handleCopy}
              disabled={copied}
              className="ml-2"
            >
              {copied ? <CheckIcon className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleEmailShare} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default InviteFriend;
