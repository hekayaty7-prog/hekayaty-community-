// =====================================================
// SUPABASE EDGE FUNCTION: Upload Artwork
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { title, description, image_url, tags, medium, dimensions } = await req.json()

    // Validate required fields
    if (!title || !image_url) {
      return new Response(
        JSON.stringify({ error: 'Title and image URL are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create artwork entry
    const { data: artwork, error } = await supabaseClient
      .from('artworks')
      .insert({
        title,
        description: description || null,
        image_url,
        artist_id: user.id,
        tags: tags || [],
        medium: medium || null,
        dimensions: dimensions || null,
        is_featured: false,
        is_for_sale: false,
      })
      .select(`
        *,
        artist:storyweave_profiles(username, display_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating artwork:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create artwork' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ data: artwork }),
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
