import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 transparent pixel GIF
const transparentPixel = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);
    const trackingToken = url.searchParams.get('token');

    if (!trackingToken) {
      console.error('No tracking token provided');
      // Still return the pixel even if tracking fails
      return new Response(transparentPixel, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    console.log(`Tracking email open for token: ${trackingToken}`);

    // Get existing tracking record
    const { data: tracking, error: fetchError } = await supabase
      .from('email_tracking')
      .select('*')
      .eq('tracking_token', trackingToken)
      .single();

    if (fetchError || !tracking) {
      console.error('Error fetching tracking record:', fetchError);
      return new Response(transparentPixel, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Update tracking record
    const updateData: any = {
      open_count: tracking.open_count + 1,
    };

    // Set opened_at only on first open
    if (!tracking.opened_at) {
      updateData.opened_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('email_tracking')
      .update(updateData)
      .eq('tracking_token', trackingToken);

    if (updateError) {
      console.error('Error updating tracking:', updateError);
    } else {
      console.log(`Email open tracked: ${tracking.email}, open count: ${tracking.open_count + 1}`);
    }

    // Return transparent pixel
    return new Response(transparentPixel, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in track-email-open:', error);
    // Always return the pixel even on error
    return new Response(transparentPixel, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
});
