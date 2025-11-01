import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendRequest {
  user_ids: string[];
  subject: string;
  message: string;
  delivery_method: 'email' | 'whatsapp' | 'notification';
}

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

    console.log('Starting notification send process...');

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Unauthorized access');
    }

    // Verify user is super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      throw new Error('User profile not found');
    }

    if (profile.role !== 'super_admin' || profile.email !== 'royan.shaw@gmail.com') {
      console.error('Permission denied for user:', profile.email);
      throw new Error('Insufficient permissions - super admin required');
    }

    const requestBody: SendRequest = await req.json();
    const { user_ids, subject, message, delivery_method = 'email' } = requestBody;

    // Validate input
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      throw new Error('Invalid or empty user_ids array');
    }

    if (!subject?.trim()) {
      throw new Error('Subject is required');
    }

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    console.log(`Processing ${delivery_method} to ${user_ids.length} users...`);

    // Fetch recipient details
    const { data: recipients, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, name, phone_number')
      .in('id', user_ids);

    if (usersError) {
      console.error('Error fetching recipients:', usersError);
      throw usersError;
    }

    if (!recipients || recipients.length === 0) {
      throw new Error('No valid recipients found');
    }

    console.log(`Found ${recipients.length} recipients`);

    // Create email campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        sender_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        total_recipients: recipients.length,
        status: 'sending',
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      throw campaignError;
    }

    console.log(`Created campaign: ${campaign.id}`);

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        sender_id: user.id,
        title: subject.trim(),
        content: message.trim(),
        notification_type: 'admin_message',
        status: 'sending',
        target_audience: { user_ids },
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    const results = [];

    // Send based on delivery method
    if (delivery_method === 'email') {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || '';
      
      for (const recipient of recipients) {
        // Generate unique tracking token
        const trackingToken = crypto.randomUUID();
        
        // Create tracking record
        const { error: trackingError } = await supabase
          .from('email_tracking')
          .insert({
            campaign_id: campaign.id,
            user_id: recipient.id,
            email: recipient.email,
            status: 'queued',
            tracking_token: trackingToken,
          });

        if (trackingError) {
          console.error('Error creating tracking record:', trackingError);
        }

        try {
          const personalizedMessage = message.replace(/{user_name}/g, recipient.name || recipient.email);
          
          // Add tracking pixel and links
          const trackingPixelUrl = `${baseUrl}/functions/v1/track-email-open?token=${trackingToken}`;
          const trackedHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Traderama</h1>
              </div>
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">${subject.trim()}</h2>
                <div style="color: #374151; line-height: 1.8; font-size: 16px;">
                  ${personalizedMessage.split('\n').map(line => `<p style="margin: 12px 0;">${line}</p>`).join('')}
                </div>
              </div>
              <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  This is an official message from Traderama. For support, please visit our help center.
                </p>
              </div>
              <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />
            </div>
          `;
          
          // Update tracking status to sending
          await supabase
            .from('email_tracking')
            .update({ status: 'sending' })
            .eq('tracking_token', trackingToken);

          const { data, error } = await resend.emails.send({
            from: 'Traderama <onboarding@resend.dev>',
            to: [recipient.email],
            subject: subject.trim(),
            html: trackedHtml,
          });

          if (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error);
            
            // Update tracking with failure
            await supabase
              .from('email_tracking')
              .update({ 
                status: 'failed',
                error_message: error.message 
              })
              .eq('tracking_token', trackingToken);

            results.push({ 
              recipient: recipient.email, 
              success: false, 
              error: error.message 
            });
          } else {
            console.log(`Email sent successfully to ${recipient.email}`);
            
            // Update tracking with success
            await supabase
              .from('email_tracking')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString() 
              })
              .eq('tracking_token', trackingToken);

            results.push({ 
              recipient: recipient.email, 
              success: true, 
              messageId: data?.id 
            });

            // Create notification recipient record
            await supabase.from('notification_recipients').insert({
              notification_id: notification.id,
              user_id: recipient.id,
              delivered_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Exception sending to ${recipient.email}:`, error);
          
          // Update tracking with error
          await supabase
            .from('email_tracking')
            .update({ 
              status: 'failed',
              error_message: error.message 
            })
            .eq('tracking_token', trackingToken);

          results.push({ 
            recipient: recipient.email, 
            success: false, 
            error: error.message 
          });
        }
      }
    } else if (delivery_method === 'whatsapp') {
      // WhatsApp implementation placeholder
      for (const recipient of recipients) {
        if (!recipient.phone_number) {
          results.push({
            recipient: recipient.email,
            success: false,
            error: 'No phone number available'
          });
          continue;
        }

        // Create notification recipient record
        await supabase.from('notification_recipients').insert({
          notification_id: notification.id,
          user_id: recipient.id,
          delivered_at: new Date().toISOString(),
        });

        results.push({
          recipient: recipient.phone_number,
          success: true,
          note: 'WhatsApp delivery pending implementation'
        });
      }
    } else {
      // In-app notification only
      for (const recipient of recipients) {
        await supabase.from('notification_recipients').insert({
          notification_id: notification.id,
          user_id: recipient.id,
          delivered_at: new Date().toISOString(),
        });
        results.push({
          recipient: recipient.email,
          success: true,
          type: 'in-app'
        });
      }
    }

    // Calculate summary
    const successCount = results.filter(r => r.success).length;
    const finalStatus = successCount === results.length ? 'sent' : 
                       successCount > 0 ? 'partial' : 'failed';

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: finalStatus === 'sent' ? 'completed' : finalStatus,
        sent_at: new Date().toISOString(),
      })
      .eq('id', campaign.id);

    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
      })
      .eq('id', notification.id);

    console.log(`Campaign ${campaign.id} complete: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaign.id,
        notification_id: notification.id,
        results,
        summary: {
          total: results.length,
          sent: successCount,
          failed: results.length - successCount,
          status: finalStatus,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Critical error in send-notifications:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
