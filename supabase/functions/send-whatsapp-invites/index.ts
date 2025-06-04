
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Friend {
  name: string;
  phoneNumber: string;
}

interface WhatsAppInviteRequest {
  friends: Friend[];
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { friends, message }: WhatsAppInviteRequest = await req.json();

    if (!friends || friends.length === 0) {
      throw new Error("No friends provided");
    }

    if (friends.length > 5) {
      throw new Error("Maximum 5 friends allowed");
    }

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const results = [];

    // Send WhatsApp message to each friend
    for (const friend of friends) {
      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: `whatsapp:${twilioWhatsAppNumber}`,
              To: `whatsapp:${friend.phoneNumber}`,
              Body: `Hi ${friend.name}! ${message}`,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error(`Failed to send to ${friend.name}:`, error);
          results.push({
            name: friend.name,
            phoneNumber: friend.phoneNumber,
            success: false,
            error: error
          });
        } else {
          const result = await response.json();
          console.log(`Successfully sent to ${friend.name}:`, result.sid);
          results.push({
            name: friend.name,
            phoneNumber: friend.phoneNumber,
            success: true,
            messageSid: result.sid
          });
        }
      } catch (error) {
        console.error(`Error sending to ${friend.name}:`, error);
        results.push({
          name: friend.name,
          phoneNumber: friend.phoneNumber,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(JSON.stringify({
      message: `Sent ${successCount} of ${friends.length} invites successfully`,
      results: results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-whatsapp-invites function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
