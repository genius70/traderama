
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

const UpgradeToPremium = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPremium, subscriptionTier, expiresAt, loading: loadingPremium } = usePremiumStatus();

  const plans = {
    monthly: { price: 30, period: 'month', savings: 0 },
    annual: { price: 200, period: 'year', savings: 160 }
  };

  const paymentProviders = {
    stripe: 'Stripe (Credit/Debit Cards)',
    wise: 'Wise (Bank Transfer)',
    airtm: 'AirTM (Multiple Options)'
  };

  const premiumFeatures = [
    'Unlimited strategy subscriptions',
    'Advanced analytics dashboard',
    'Real-time market data',
    'Premium broker integrations',
    'Priority customer support',
    'Advanced risk management tools',
    'Custom strategy builder',
    'Portfolio optimization tools'
  ];

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const currentPlan = plans[selectedPlan as keyof typeof plans];

    try {
      if (selectedProvider === 'stripe') {
        // Use Stripe checkout
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            plan: selectedPlan === 'monthly' ? 'premium' : 'premium-annual',
            amount: currentPlan.price * 100, // Convert to cents
          },
        });
        if (error || !data?.url) throw new Error(error?.message || "Payment initiation failed");
        window.open(data.url, "_blank");
        toast({
          title: "Stripe checkout",
          description: "Complete your payment in the new tab.",
        });
      } else if (selectedProvider === 'airtm') {
        // AirTM payment URL
        const airtmUrl = `https://www.airtm.com/send-money?amount=${currentPlan.price}&currency=USD&recipient=royan.shaw@gmail.com&memo=Premium%20Upgrade%20${selectedPlan}%20User%20${user.id}`;
        window.open(airtmUrl, "_blank");
        toast({
          title: "AirTM Payment",
          description: "Complete your payment on AirTM. Your subscription will be activated within 24 hours.",
        });
      } else if (selectedProvider === 'wise') {
        // Wise payment URL
        const wiseUrl = `https://wise.com/send?source=USD&target=USD&amount=${currentPlan.price}&recipient=royan.shaw@gmail.com&reference=Premium%20Upgrade%20${selectedPlan}%20User%20${user.id}`;
        window.open(wiseUrl, "_blank");
        toast({
          title: "Wise Payment",
          description: "Complete your payment on Wise. Your subscription will be activated within 24 hours.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upgrade failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          disabled={isPremium || loadingPremium}
        >
          <Crown className="h-4 w-4 mr-2" />
          {loadingPremium ? "Checking..." : isPremium ? "Premium Active" : "Upgrade to Premium"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            {isPremium ? "Your Premium Membership" : "Upgrade to Premium"}
          </DialogTitle>
          <DialogDescription>
            {isPremium
              ? `Your plan: ${subscriptionTier ?? "Premium"}${expiresAt ? " (expires " + new Date(expiresAt).toLocaleDateString() + ")" : ""}`
              : "Unlock advanced trading features and premium analytics"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Selection — disabled if already premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'ring-2 ring-blue-500' : ''} ${isPremium ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => !isPremium && setSelectedPlan('monthly')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly
                  {selectedPlan === 'monthly' && <Badge variant="default">Selected</Badge>}
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">${plans.monthly.price}</span>/month
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${selectedPlan === 'annual' ? 'ring-2 ring-blue-500' : ''} ${isPremium ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => !isPremium && setSelectedPlan('annual')}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Annual
                  {selectedPlan === 'annual' && <Badge variant="default">Selected</Badge>}
                  <Badge variant="secondary" className="ml-2">Save ${plans.annual.savings}</Badge>
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">${plans.annual.price}</span>/year
                  <span className="text-sm text-gray-500 block">($16.67/month)</span>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Payment Provider Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={isPremium}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe (Credit/Debit Cards)</SelectItem>
                <SelectItem value="wise">Wise (Bank Transfer)</SelectItem>
                <SelectItem value="airtm">AirTM (Multiple Options)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features List */}
          <div>
            <h4 className="font-semibold mb-3">Premium Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Button */}
          {!isPremium && (
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade for ${currentPlan.price}/{currentPlan.period}
                </>
              )}
            </Button>
          )}
          {isPremium && (
            <div className="w-full text-center text-green-600 text-lg font-semibold">You are a Premium Member!</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeToPremium;
