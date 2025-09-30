// =====================================================
// SUPABASE EDGE FUNCTION: Process Images
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
    const { image_url, transformations } = await req.json()

    if (!image_url) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Process image transformations using Cloudinary
    const cloudinaryUrl = Deno.env.get('CLOUDINARY_URL')
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')
    
    if (!cloudName) {
      return new Response(
        JSON.stringify({ error: 'Cloudinary not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate different image sizes for optimization
    const sizes = {
      thumbnail: `https://res.cloudinary.com/${cloudName}/image/fetch/w_150,h_150,c_fill,f_auto,q_auto/${encodeURIComponent(image_url)}`,
      small: `https://res.cloudinary.com/${cloudName}/image/fetch/w_400,h_300,c_fill,f_auto,q_auto/${encodeURIComponent(image_url)}`,
      medium: `https://res.cloudinary.com/${cloudName}/image/fetch/w_800,h_600,c_fill,f_auto,q_auto/${encodeURIComponent(image_url)}`,
      large: `https://res.cloudinary.com/${cloudName}/image/fetch/w_1200,h_900,c_fill,f_auto,q_auto/${encodeURIComponent(image_url)}`,
      original: image_url
    }

    // Apply custom transformations if provided
    if (transformations && Array.isArray(transformations)) {
      const transformString = transformations.join(',')
      sizes.custom = `https://res.cloudinary.com/${cloudName}/image/fetch/${transformString}/${encodeURIComponent(image_url)}`
    }

    // Log the processing activity
    await supabaseClient
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'image_processed',
        activity_data: {
          original_url: image_url,
          processed_sizes: Object.keys(sizes),
          transformations: transformations || []
        },
        points_earned: 1
      })

    // Return processed image URLs
    return new Response(
      JSON.stringify({ 
        data: {
          processed_images: sizes,
          original_url: image_url,
          processing_timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
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
