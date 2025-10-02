
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { plan, amount, productName } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Determine if it's a subscription or one-time payment
    const isSubscription = plan && (plan.includes('premium') || plan.includes('annual'));
    
    let sessionConfig: unknown = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
    };

    if (isSubscription) {
      // Subscription setup
      let unitAmount = 2500; // Default $25
      let interval = "month";
      
      if (plan === 'premium-annual') {
        unitAmount = 20000; // $200 annual
        interval = "year";
      } else if (plan === 'premium-groups') {
        unitAmount = 5000; // $50
      }

      sessionConfig = {
        ...sessionConfig,
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: productName || `Premium ${plan === 'premium-annual' ? 'Annual' : 'Monthly'} Subscription`
              },
              unit_amount: unitAmount,
              recurring: { interval },
            },
            quantity: 1,
          },
        ],
      };
    } else {
      // One-time payment
      const paymentAmount = amount || 5000; // Default $50
      sessionConfig = {
        ...sessionConfig,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: productName || "Premium Service" },
              unit_amount: paymentAmount,
            },
            quantity: 1,
          },
        ],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
