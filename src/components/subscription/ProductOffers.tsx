
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, DollarSign, Package } from 'lucide-react';

interface ProductOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const ProductOffers = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for product offers
  const offers: ProductOffer[] = [
    {
      id: '1',
      name: 'Basic Plan',
      description: 'Perfect for beginners getting started with trading',
      price: 29,
      features: [
        'Access to basic trading strategies',
        'Community forum access',
        'Email support',
        'Basic analytics dashboard'
      ]
    },
    {
      id: '2',
      name: 'Pro Plan',
      description: 'Advanced features for serious traders',
      price: 79,
      features: [
        'All Basic Plan features',
        'Advanced trading strategies',
        'Real-time market data',
        'Priority support',
        'Custom strategy builder',
        'Risk management tools'
      ]
    },
    {
      id: '3',
      name: 'Elite Plan',
      description: 'Premium experience for professional traders',
      price: 149,
      features: [
        'All Pro Plan features',
        'One-on-one coaching sessions',
        'Exclusive trading signals',
        'Advanced portfolio analytics',
        'API access',
        'White-label solutions'
      ]
    }
  ];

  const handlePurchase = async (offerId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Purchase successful!",
      });
      
      // In a real app, this would redirect to Stripe checkout
      console.log(`Purchasing offer: ${offerId}`);
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span>Product Offers</span>
          </CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <CardTitle className="text-xl font-semibold text-gray-900">{offer.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{offer.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center text-2xl font-bold text-blue-600">
                    <DollarSign className="h-5 w-5 mr-1" />
                    {offer.price}
                  </div>
                  <p className="text-gray-500">per month</p>
                </div>
                <ul className="mt-4 space-y-2">
                  {offer.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  onClick={() => handlePurchase(offer.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductOffers;
