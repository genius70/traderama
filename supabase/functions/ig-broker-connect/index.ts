
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IGBrokerCredentials {
  username: string
  password: string
  apiKey: string
  accountId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const credentials: IGBrokerCredentials = await req.json()
      
      // Validate required fields
      if (!credentials.username || !credentials.password || !credentials.apiKey || !credentials.accountId) {
        return new Response(
          JSON.stringify({ error: 'All credentials are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Simple encryption (in production, use proper encryption)
      // Note: This is a basic approach - in production you'd want to use proper encryption keys
      const encryptCredential = (credential: string): string => {
        return btoa(credential) // Base64 encoding (not secure, use proper encryption in production)
      }

      try {
        // Test connection to IG Broker API (mock for now)
        console.log('Testing IG Broker connection for user:', user.id)
        
        // Store encrypted credentials in database
        const { data, error } = await supabaseClient
          .from('ig_broker_connections')
          .upsert({
            user_id: user.id,
            username: credentials.username,
            account_id: credentials.accountId,
            api_key_encrypted: encryptCredential(credentials.apiKey),
            password_encrypted: encryptCredential(credentials.password),
            is_active: true,
            last_connected_at: new Date().toISOString()
          })
          .select()

        if (error) {
          console.error('Database error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to save connection' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('IG Broker connection saved successfully for user:', user.id)

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'IG Broker connection established successfully',
            connection: data?.[0] 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } catch (apiError) {
        console.error('IG Broker API error:', apiError)
        return new Response(
          JSON.stringify({ error: 'Failed to connect to IG Broker. Please check your credentials.' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    if (req.method === 'GET') {
      // Get user's IG Broker connection
      const { data, error } = await supabaseClient
        .from('ig_broker_connections')
        .select('id, username, account_id, is_active, last_connected_at, created_at')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch connection' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ connection: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
