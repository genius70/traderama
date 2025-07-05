
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import StrategiesSection from "@/components/home/StrategiesSection";
import CTASection from "@/components/home/CTASection";

interface Strategy {
  id: string;
  title: string;
  description: string;
  fee_percentage: number;
  strategy_config: unknown;
  performance_metrics: unknown;
  creator_id: string;
  is_premium_only: boolean;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  } | null;
}

const Index: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("Index component mounted");
  console.log("User:", user);

  const fetchStrategies = useCallback(async (): Promise<void> => {
    console.log("Fetching strategies...");
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("trading_strategies")
        .select(
          `
          *,
          profiles (
            name,
            email
          )
        `,
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Supabase error:", error);
        // Don't throw error, just show empty state
        setStrategies([]);
        return;
      }

      console.log("Strategies fetched:", data);
      setStrategies(data || []);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      setStrategies([]);
      toast({
        title: "Error loading strategies",
        description: "Using sample data instead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Add a small delay to ensure components are mounted
    const timer = setTimeout(() => {
      fetchStrategies();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchStrategies]);

  const subscribeToStrategy = async (strategyId: string): Promise<void> => {
    console.log("Subscribing to strategy:", strategyId);
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to strategies",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("strategy_subscriptions").insert({
        strategy_id: strategyId,
        user_id: user.id,
      });

      if (error) {
        console.error("Subscription error:", error);
        throw error;
      }

      toast({
        title: "Strategy subscribed!",
        description: "You have successfully subscribed to this strategy",
      });
    } catch (error) {
      console.error("Error subscribing to strategy:", error);
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  console.log("Rendering Index component");

  return (
    <div className="min-h-screen bg-white">
      <HeroSection user={user} />
      <FeaturesSection />
      <StrategiesSection
        strategies={strategies}
        loading={loading}
        user={user}
        onSubscribe={subscribeToStrategy}
      />
      <CTASection />
    </div>
  );
};

export default Index;
