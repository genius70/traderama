import { createClient } from "@supabase/supabase-js";
import { serve } from "std/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const body = await req.json();
    const { phone_numbers, message } = body;
    
    console.log('Received request:', { phone_numbers, messageLength: message?.length });

    if (!phone_numbers || !Array.isArray(phone_numbers)) {
      return new Response(JSON.stringify({
        error: 'phone_numbers array is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN_LIVE');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      return new Response(JSON.stringify({
        error: 'Twilio credentials not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const results = [];
    console.log(`Sending messages to ${phone_numbers.length} numbers`);
    
    for (const phoneNumber of phone_numbers) {
      try {
        console.log(`Sending to: ${phoneNumber}`);
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              From: `whatsapp:${twilioWhatsAppNumber}`,
              To: `whatsapp:${phoneNumber}`,
              Body: message || 'Join Traderama Pro for exclusive trading strategies!'
            })
          }
        );

        const data = await response.json();
        console.log(`Response for ${phoneNumber}:`, data);
        
        if (response.ok) {
          results.push({
            phoneNumber,
            success: true,
            sid: data.sid
          });
        } else {
          results.push({
            phoneNumber,
            success: false,
            error: data.message || 'Unknown error'
          });
        }
      } catch (error: any) {
        console.error(`Error sending to ${phoneNumber}:`, error);
        results.push({
          phoneNumber,
          success: false,
          error: error.message || 'Network error'
        });
      }
    }
    
    console.log('All messages processed:', results);

    return new Response(JSON.stringify({
      results
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('WhatsApp invite error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
