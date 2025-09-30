// =====================================================
// SUPABASE EDGE FUNCTION: Get Community Statistics
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors, createErrorResponse, createSuccessResponse } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Create Supabase client (no auth required for public stats)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get community statistics
    const [
      { count: totalUsers },
      { count: totalThreads },
      { count: totalArtworks },
      { count: totalWorkshops },
      { count: totalBookClubs }
    ] = await Promise.all([
      supabaseClient.from('storyweave_profiles').select('*', { count: 'exact', head: true }),
      supabaseClient.from('discussion_threads').select('*', { count: 'exact', head: true }),
      supabaseClient.from('artworks').select('*', { count: 'exact', head: true }),
      supabaseClient.from('workshops').select('*', { count: 'exact', head: true }),
      supabaseClient.from('book_clubs').select('*', { count: 'exact', head: true })
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentThreads } = await supabaseClient
      .from('discussion_threads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    const { count: recentArtworks } = await supabaseClient
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // Get top contributors (most active users)
    const { data: topContributors } = await supabaseClient
      .from('storyweave_profiles')
      .select('username, display_name, avatar_url, total_points')
      .order('total_points', { ascending: false })
      .limit(5)

    const stats = {
      totals: {
        users: totalUsers || 0,
        discussions: totalThreads || 0,
        artworks: totalArtworks || 0,
        workshops: totalWorkshops || 0,
        bookClubs: totalBookClubs || 0
      },
      recent: {
        discussions_this_week: recentThreads || 0,
        artworks_this_week: recentArtworks || 0
      },
      topContributors: topContributors || [],
      lastUpdated: new Date().toISOString()
    }

    return createSuccessResponse(stats)

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Failed to fetch community statistics')
  }
})
