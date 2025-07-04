import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, DollarSign, Package } from 'lucide-react';

interface ProductOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const ProductOffers = () => {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from('product_offers')
          .select('*')
          .order('price');

        if (error) {
          console.error('Error fetching product offers:', error);
          toast({
            title: "Error fetching offers",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setOffers(data.map(offer => ({
            id: offer.id,
            name: offer.name,
            description: offer.description,
            price: offer.price,
            features: offer.features || [],
          })));
        }
      } catch (error) {
        console.error('Failed to fetch product offers:', error);
        toast({
          title: "Failed to load offers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [toast]);

  const handlePurchase = async (offerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: offerId },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Purchase failed",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Purchase failed",
          variant: "destructive",
        });
      }
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
          {loading ? (
            <p className="text-center text-gray-500">Loading offers...</p>
          ) : (
            offers.map((offer) => (
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
                    {loading ? 'Purchasing...' : 'Purchase'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductOffers;
