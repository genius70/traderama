
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { notificationType, userIds, filters } = await req.json()

    // Get target users based on filters
    let targetUsers = []
    
    if (userIds && userIds.length > 0) {
      // Send to specific users
      const { data } = await supabaseClient
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds)
      
      targetUsers = data || []
    } else if (filters) {
      // Apply filters to get target users
      let query = supabaseClient.from('profiles').select('id, email, name')
      
      if (filters.role) {
        query = query.eq('role', filters.role)
      }
      if (filters.isPremium) {
        // Join with premium_subscriptions to filter premium users
        query = supabaseClient
          .from('profiles')
          .select(`
            id, email, name,
            premium_subscriptions!inner(status)
          `)
          .eq('premium_subscriptions.status', 'active')
      }
      
      const { data } = await query
      targetUsers = data || []
    }

    console.log(`Sending notifications to ${targetUsers.length} users`)

    // Create notification records
    const notifications = targetUsers.map(user => ({
      user_id: user.id,
      type: notificationType || 'general',
      created_at: new Date().toISOString()
    }))

    if (notifications.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error inserting notifications:', insertError)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${targetUsers.length} users` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
