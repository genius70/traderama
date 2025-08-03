import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createTransport } from 'https://esm.sh/nodemailer';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const { user_ids, subject, message, scheduled_at } = await req.json();

  // Verify super admin
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || user.user.email !== 'royan.shaw@gmail.com' || user.user.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  // Fetch user details for personalization
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', user_ids);

  if (profileError) {
    return new Response(JSON.stringify({ error: 'Error fetching user data' }), { status: 500 });
  }

  const messageId = crypto.randomUUID();
  const table = scheduled_at ? 'scheduled_messages' : 'messages';
  let status = scheduled_at ? 'scheduled' : 'draft';

  // Log message
  const { error: logError } = await supabase.from(table).insert({
    id: messageId,
    super_admin_id: user.user.id,
    user_ids,
    subject,
    message,
    status,
    sent_at: scheduled_at ? null : new Date().toISOString(),
    scheduled_at,
  });

  if (logError) {
    return new Response(JSON.stringify({ error: 'Error logging message' }), { status: 500 });
  }

  // Skip sending if scheduled
  if (scheduled_at) {
    return new Response(JSON.stringify({ message: 'Message scheduled' }), { status: 200 });
  }

  // Initialize SMTP
  const transporter = createTransport({
    host: Deno.env.get('SMTP_HOST'),
    port: Number(Deno.env.get('SMTP_PORT')),
    secure: Number(Deno.env.get('SMTP_PORT')) === 465,
    auth: {
      user: Deno.env.get('SMTP_USER'),
      pass: Deno.env.get('SMTP_PASS'),
    },
  });

  let errors: string[] = [];

  // Send emails
  for (const profile of profiles) {
    const personalizedMessage = message
      .replace('{user_name}', profile.name || 'User')
      .replace('{user_email}', profile.email);

    try {
      await transporter.sendMail({
        from: '"Traderama" <no-reply@traderama.com>',
        to: profile.email,
        subject,
        text: personalizedMessage,
        html: `<p>${personalizedMessage.replace(/\n/g, '<br>')}</p>`,
      });
    } catch (error) {
      errors.push(`Email failed for ${profile.email}: ${error.message}`);
    }
  }

  // Update status
  status = errors.length ? 'archived' : 'sent';
  const { error: updateError } = await supabase
    .from('messages')
    .update({ status, error: errors.length ? errors.join('; ') : null })
    .eq('id', messageId);

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Error updating status' }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Notifications processed', errors }), { status: errors.length ? 207 : 200 });
});
