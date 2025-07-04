import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

interface KemCredits {
  credits_earned: number;
  credits_spent: number;
  total_airdrops_received: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [kemCredits, setKemCredits] = useState<KemCredits | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (kemCredits) {
      setProgressValue(kemCredits.credits_earned % 100);
    }
  }, [kemCredits]);

  const fetchUserKemCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('kem_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setKemCredits(data);
      }
    } catch (error) {
      toast({
        title: "Error fetching KEM credits",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserKemCredits();
  }, [user]);

  const nextMilestone = kemCredits ? Math.ceil(kemCredits.credits_earned / 100) * 100 : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-green-600" />
          <span>KEM Credits Overview</span>
        </CardTitle>
        <CardDescription>Track your KEM credits and progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-lg font-semibold">
              {kemCredits?.credits_earned || 0}
            </div>
            <div className="text-sm text-gray-500">Credits Earned</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {kemCredits?.credits_spent || 0}
            </div>
            <div className="text-sm text-gray-500">Credits Spent</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {kemCredits?.total_airdrops_received || 0} KEM
            </div>
            <div className="text-sm text-gray-500">Airdrops Received</div>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium">
            Next Milestone: {nextMilestone} Credits
          </div>
          <Progress value={progressValue} max={100} />
          <p className="text-xs text-gray-500 mt-1">
            {progressValue} / 100 Credits
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDashboard;
