// =====================================================
// SUPABASE EDGE FUNCTION: Send Notifications
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'workshop_invite' | 'achievement'
  title: string
  message: string
  data?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const notifications: NotificationPayload[] = await req.json()

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid notifications payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create notifications in database
    const notificationInserts = notifications.map(notification => ({
      ...notification,
      sender_id: user.id,
      is_read: false,
      created_at: new Date().toISOString(),
    }))

    const { data: createdNotifications, error } = await supabaseClient
      .from('notifications')
      .insert(notificationInserts)
      .select()

    if (error) {
      console.error('Error creating notifications:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create notifications' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Here you could add push notification logic
    // For example, using Firebase Cloud Messaging or similar service

    // Return success response
    return new Response(
      JSON.stringify({ 
        data: createdNotifications,
        message: `${createdNotifications?.length || 0} notifications sent successfully`
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
