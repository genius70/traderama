import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    
    // If no body, return existing connection
    if (!body) {
      const { data: connection, error } = await supabase
        .from('ig_broker_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return new Response(
        JSON.stringify({ connection: connection || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse credentials from body
    const { username, password, apiKey, accountId } = JSON.parse(body);

    if (!username || !password || !apiKey || !accountId) {
      return new Response(
        JSON.stringify({ error: 'Username, password, apiKey, and accountId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test connection to IG API
    try {
      const authResponse = await fetch('https://demo-api.ig.com/gateway/deal/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IG-API-KEY': apiKey,
          'Version': '2',
        },
        body: JSON.stringify({
          identifier: username,
          password: password,
        }),
      });

      const authData = await authResponse.json();
      
      if (!authResponse.ok) {
        throw new Error(authData.errorCode || 'IG API authentication failed');
      }

      // Deactivate any existing connections
      await supabase
        .from('ig_broker_connections')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Store new connection (encrypt sensitive data in production)
      const { data: connection, error: insertError } = await supabase
        .from('ig_broker_connections')
        .insert({
          user_id: user.id,
          username,
          password_encrypted: password, // In production, encrypt this
          api_key_encrypted: apiKey, // In production, encrypt this
          account_id: accountId,
          is_active: true,
          last_connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection: {
            id: connection.id,
            username: connection.username,
            account_id: connection.account_id,
            is_active: connection.is_active,
            last_connected_at: connection.last_connected_at,
            created_at: connection.created_at,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (igError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `IG API connection failed: ${igError.message}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('IG Broker connect error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});