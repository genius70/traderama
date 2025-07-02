import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Mail, CreditCard, Building, Banknote, Check, Star, Users, Plus } from 'lucide-react';
import PremiumGroupCheckoutDialog from '@/components/community/PremiumGroupCheckoutDialog';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
}

interface PaymentError extends Error {
  message: string;
}

const ProductOffers: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [premiumGroupDialogOpen, setPremiumGroupDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'premium',
      name: 'Premium Membership',
      price: 25,
      currency: 'USD',
      features: [
        'Advanced trading strategies',
        'Real-time market data',
        'Priority customer support',
        'Exclusive community access',
        'Advanced analytics dashboard',
        'Copy trading features'
      ],
      popular: true
    },
    {
      id: 'premium-groups',
      name: 'Premium Groups',
      price: 50,
      currency: 'USD',
      features: [
        'Create exclusive trading groups',
        'Private strategy sharing',
        'Group-only discussions',
        'Advanced moderation tools',
        'Custom group branding',
        'Up to 500 members per group'
      ]
    }
  ];

  const notificationService = {
    name: 'Strategy Creator Email Service',
    price: 3000,
    currency: 'USD',
    description: 'Send targeted emails to our entire trading community database',
    features: [
      'Reach 10,000+ active traders',
      'Segmented targeting options',
      'Professional email templates',
      'Detailed analytics & reporting',
      'Priority placement in newsletters'
    ]
  };

  const paymentMethods = [
    { id: 'stripe', name: 'Stripe', icon: CreditCard, description: 'Credit/Debit Cards' },
    { id: 'airtm', name: 'AirTM', icon: Building, description: 'Digital Wallet' },
    { id: 'wise', name: 'Wise', icon: Banknote, description: 'Bank Transfer' }
  ];

  const handleNotificationService = async (paymentMethod: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase this service.",
        variant: "destructive",
      });
      return;
    }

    setLoading(`notification-${paymentMethod}`);

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          sender_id: user.id,
          title: 'Email Campaign Request',
          content: 'Strategy creator email service purchase',
          notification_type: 'strategy_creator',
          cost: 3000,
          status: 'draft'
        }]);

      if (error) throw error;

      toast({
        title: "Service Purchase Initiated!",
        description: "Our team will contact you to set up your email campaign.",
      });

    } catch (error) {
      const supabaseError = error as SupabaseError;
      toast({
        title: "Error",
        description: supabaseError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Helper for Stripe Checkout for subscriptions
  const handleStripeCheckout = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }
    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan: planId,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Payment initiation failed");
      window.open(data.url, "_blank");
      toast({
        title: "Stripe checkout",
        description: "Complete your payment in the new tab.",
      });
    } catch (err) {
      const paymentError = err as PaymentError;
      toast({
        title: "Payment Error",
        description: paymentError.message,
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  // Helper for AirTM payments
  const handleAirTMPayment = (planId: string, amount: number) => {
    setLoading(`airtm-${planId}`);
    try {
      // AirTM payment URL with proper parameters
      const airtmUrl = `https://www.airtm.com/send-money?amount=${amount}&currency=USD&recipient=royan.shaw@gmail.com&memo=Premium%20Plan%20${planId}%20User%20${user?.id || 'unknown'}`;
      window.open(airtmUrl, "_blank");
      toast({
        title: "AirTM Payment",
        description: "Complete your payment on AirTM. Your subscription will be activated within 24 hours.",
      });
    } catch (err) {
      const paymentError = err as PaymentError;
      toast({
        title: "Payment Error",
        description: paymentError.message,
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  // Helper for Wise payments
  const handleWisePayment = (planId: string, amount: number) => {
    setLoading(`wise-${planId}`);
    try {
      // Wise payment URL - using their send money feature
      const wiseUrl = `https://wise.com/send?source=USD&target=USD&amount=${amount}&recipient=royan.shaw@gmail.com&reference=Premium%20Plan%20${planId}%20User%20${user?.id || 'unknown'}`;
      window.open(wiseUrl, "_blank");
      toast({
        title: "Wise Payment",
        description: "Complete your payment on Wise. Your subscription will be activated within 24 hours.",
      });
    } catch (err) {
      const paymentError = err as PaymentError;
      toast({
        title: "Payment Error",
        description: paymentError.message,
        variant: "destructive"
      });
    }
    setLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Products & Services</h1>
        <p className="text-lg text-gray-600">Unlock advanced trading features and reach thousands of traders</p>
      </div>

      {/* Premium Subscription Plans */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-purple-200 shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                {plan.id === 'premium-groups' ? (
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                ) : (
                  <Crown className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'premium-groups' && (
                  <Button
                    className="w-full mb-4"
                    onClick={() => setPremiumGroupDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Premium Group
                  </Button>
                )}

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Payment Methods:</p>
                  
                  {/* Stripe - real payment */}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStripeCheckout(plan.id)}
                    disabled={loading === plan.id}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Stripe</div>
                      <div className="text-xs text-gray-500">Credit/Debit Cards</div>
                    </div>
                    {loading === plan.id && <div className="ml-auto">Processing...</div>}
                  </Button>

                  {/* AirTM - direct payment URL */}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleAirTMPayment(plan.id, plan.price)}
                    disabled={loading === `airtm-${plan.id}`}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">AirTM</div>
                      <div className="text-xs text-gray-500">Instant Payment</div>
                    </div>
                    {loading === `airtm-${plan.id}` && <div className="ml-auto">Processing...</div>}
                  </Button>

                  {/* Wise - direct payment URL */}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleWisePayment(plan.id, plan.price)}
                    disabled={loading === `wise-${plan.id}`}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Wise</div>
                      <div className="text-xs text-gray-500">Bank Transfer</div>
                    </div>
                    {loading === `wise-${plan.id}` && <div className="ml-auto">Processing...</div>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Strategy Creator Email Service */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Strategy Creator Services</h2>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-2xl text-blue-900">{notificationService.name}</CardTitle>
            <CardDescription className="text-lg">{notificationService.description}</CardDescription>
            <div className="text-4xl font-bold text-blue-900 mt-4">
              ${notificationService.price.toLocaleString()}
              <span className="text-lg font-normal text-blue-600">/campaign</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Service Features:</h3>
                <ul className="space-y-2">
                  {notificationService.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <p className="font-semibold text-blue-900">Get Started:</p>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      variant="outline"
                      className="w-full justify-start border-blue-200 hover:bg-blue-50"
                      onClick={() => handleNotificationService(method.id)}
                      disabled={loading === `notification-${method.id}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Purchase with {method.name}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </div>
                      {loading === `notification-${method.id}` && (
                        <div className="ml-auto">Processing...</div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Trading Commission Info */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Trading Commission Structure</h2>
        <Card>
          <CardHeader>
            <CardTitle>Copy Trading Fees</CardTitle>
            <CardDescription>Commission structure for strategy creators and copy traders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Strategy Creator Fees</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Minimum commission: 5%</li>
                  <li>• Maximum commission: 25%</li>
                  <li>• Set your own rate within this range</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Platform Fees</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Traderama commission: 2.5% (fixed)</li>
                  <li>• Deducted from all trades</li>
                  <li>• Covers escrow and platform services</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Escrow Protection</h4>
              <p className="text-sm text-blue-700">
                All trades are processed through secure escrow accounts managed by Traderama.com, 
                ensuring safe and transparent transactions for all parties.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <PremiumGroupCheckoutDialog 
        open={premiumGroupDialogOpen} 
        onOpenChange={setPremiumGroupDialogOpen} 
      />
    </div>
  );
};

export default ProductOffers;
