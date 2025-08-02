import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { Client } from 'https://deno.land/x/twilio/mod.ts';
import { createTransport } from 'https://esm.sh/nodemailer';

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const now = new Date().toISOString();  // Fetch scheduled messages due now
  const { data: messages, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .lte('scheduled_at', now)
    .eq('status', 'scheduled');  if (error) {
    return new Response(JSON.stringify({ error: 'Error fetching scheduled messages' }), { status: 500 });
  }  if (!messages.length) {
    return new Response(JSON.stringify({ message: 'No messages to process' }), { status: 200 });
  }  const twilioClient = new Client(Deno.env.get('TWILIO_ACCOUNT_SID'), Deno.env.get('TWILIO_AUTH_TOKEN'));
  const transporter = createTransport({
    host: Deno.env.get('SMTP_HOST'),
    port: Number(Deno.env.get('SMTP_PORT')),
    secure: Number(Deno.env.get('SMTP_PORT')) === 465,
    auth: {
      user: Deno.env.get('SMTP_USER'),
      pass: Deno.env.get('SMTP_PASS'),
    },
  });  for (const msg of messages) {
    const { user_ids, subject, message, delivery_method } = msg;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, phone_number')
      .in('id', user_ids);let errors: string[] = [];

for (const profile of profiles) {
  const personalizedMessage = message
    .replace('{user_name}', profile.name || 'User')
    .replace('{user_email}', profile.email);

  if (['whatsapp', 'both'].includes(delivery_method) && profile.phone_number) {
    try {
      await twilioClient.messages.create({
        from: `whatsapp:${Deno.env.get('TWILIO_PHONE_NUMBER')}`,
        to: `whatsapp:${profile.phone_number}`,
        body: personalizedMessage,
      });
    } catch (error) {
      errors.push(`WhatsApp failed for ${profile.email}: ${error.message}`);
    }
  }

  if (['email', 'both'].includes(delivery_method)) {
    try {
      await transporter.sendMail({
        from: '"Traderama" <no-reply@traderama.com>',
        to: profile.email,
        subject,
        text: personalizedMessage,
        html: `<p>${personalizedMessage.replace(/\n/g, '
')}</p>`,
      });
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
await supabase.from('scheduled_messages').delete().eq('id', msg.id);  }  return new Response(JSON.stringify({ message: 'Scheduled messages processed' }), { status: 200 });
});
