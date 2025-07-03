
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  notificationId: string;
  targetAudience: {
    country?: string;
    region?: string;
    lastLoginDays?: number;
    lastCommentDays?: number;
    activityPeriod?: string;
  };
  title: string;
  content: string;
  notificationType: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notificationId, targetAudience, title, content, notificationType }: NotificationRequest = await req.json();

    console.log('Processing notification:', { notificationId, notificationType });

    // Build user query based on target audience
    let query = supabase.from('profiles').select('id, email, name');

    if (targetAudience.country) {
      query = query.eq('location', targetAudience.country);
    }

    if (targetAudience.lastLoginDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - targetAudience.lastLoginDays);
      
      // Join with user_sessions to check last login
      query = supabase
        .from('profiles')
        .select(`
          id, email, name,
          user_sessions!inner(started_at)
        `)
        .gte('user_sessions.started_at', cutoffDate.toISOString());
    }

    const { data: targetUsers, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching target users:', usersError);
      throw usersError;
    }

    console.log(`Found ${targetUsers?.length || 0} target users`);

    // Create notification recipients
    const recipients = targetUsers?.map(user => ({
      notification_id: notificationId,
      user_id: user.id,
      delivered_at: new Date().toISOString()
    })) || [];

    if (recipients.length > 0) {
      const { error: recipientsError } = await supabase
        .from('notification_recipients')
        .insert(recipients);

      if (recipientsError) {
        console.error('Error creating recipients:', recipientsError);
        throw recipientsError;
      }

      // Update notification status
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (updateError) {
        console.error('Error updating notification:', updateError);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipientsCount: recipients.length,
        message: 'Notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
