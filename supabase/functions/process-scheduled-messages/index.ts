import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const now = new Date().toISOString();

  // Fetch scheduled messages due now
  const { data: messages, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .lte('scheduled_at', now)
    .eq('status', 'scheduled');

  if (error) {
    return new Response(JSON.stringify({ error: 'Error fetching scheduled messages' }), { status: 500 });
  }

  if (!messages.length) {
    return new Response(JSON.stringify({ message: 'No messages to process' }), { status: 200 });
  }

  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN_LIVE');
  const twilioPhoneNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

  for (const msg of messages) {
    const { user_ids, subject, message, delivery_method } = msg;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, phone_number')
      .in('id', user_ids);

    let errors: string[] = [];

    for (const profile of profiles || []) {
      const personalizedMessage = message
        .replace('{user_name}', profile.name || 'User')
        .replace('{user_email}', profile.email);

      // Send WhatsApp message via Twilio API
      if (['whatsapp', 'both'].includes(delivery_method) && profile.phone_number && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: `whatsapp:${twilioPhoneNumber}`,
                To: `whatsapp:${profile.phone_number}`,
                Body: personalizedMessage,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            errors.push(`WhatsApp failed for ${profile.email}: ${errorData.message}`);
          }
        } catch (error) {
          errors.push(`WhatsApp failed for ${profile.email}: ${error.message}`);
        }
      }

      // Send email (simplified - in production use a proper email service)
      if (['email', 'both'].includes(delivery_method)) {
        try {
          // Note: For production, integrate with a proper email service like Resend or SendGrid
          console.log(`Email would be sent to ${profile.email}: ${subject}`);
          console.log(`Content: ${personalizedMessage}`);
        } catch (error) {
          errors.push(`Email failed for ${profile.email}: ${error.message}`);
        }
      }
    }

    // Move to messages table
    await supabase.from('messages').insert({
      id: msg.id,
      super_admin_id: msg.super_admin_id,
      user_ids,
      subject,
      message,
      delivery_method,
      status: errors.length ? 'partial_failure' : 'sent',
      sent_at: new Date().toISOString(),
      error: errors.length ? errors.join('; ') : null,
    });

    // Delete from scheduled_messages
    await supabase.from('scheduled_messages').delete().eq('id', msg.id);
  }

  return new Response(JSON.stringify({ message: 'Scheduled messages processed' }), { status: 200 });
});
