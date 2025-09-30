// =====================================================
// SUPABASE EDGE FUNCTION: User Profile Management
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors, createErrorResponse, createSuccessResponse } from '../_shared/cors.ts'
import { getAuthenticatedUser } from '../_shared/auth.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const { user, supabaseClient } = await getAuthenticatedUser(req)
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const action = url.searchParams.get('action')

    switch (req.method) {
      case 'GET':
        // Get user profile
        const targetUserId = userId || user.id

        const { data: profile, error: profileError } = await supabaseClient
          .from('storyweave_profiles')
          .select(`
            *,
            user_achievements(
              achievement:achievements(name, description, icon, rarity, points_reward),
              earned_at
            )
          `)
          .eq('user_id', targetUserId)
          .single()

        if (profileError) {
          return createErrorResponse('Profile not found', 404)
        }

        // Get user statistics
        const [
          { count: threadsCount },
          { count: artworksCount },
          { count: commentsCount },
          { count: workshopsCreated },
          { count: bookClubsCreated }
        ] = await Promise.all([
          supabaseClient.from('discussion_threads').select('*', { count: 'exact', head: true }).eq('author_id', targetUserId),
          supabaseClient.from('artworks').select('*', { count: 'exact', head: true }).eq('artist_id', targetUserId),
          supabaseClient.from('thread_replies').select('*', { count: 'exact', head: true }).eq('author_id', targetUserId),
          supabaseClient.from('workshops').select('*', { count: 'exact', head: true }).eq('creator_id', targetUserId),
          supabaseClient.from('book_clubs').select('*', { count: 'exact', head: true }).eq('creator_id', targetUserId)
        ])

        const profileWithStats = {
          ...profile,
          statistics: {
            threads_created: threadsCount || 0,
            artworks_shared: artworksCount || 0,
            comments_made: commentsCount || 0,
            workshops_created: workshopsCreated || 0,
            book_clubs_created: bookClubsCreated || 0
          }
        }

        return createSuccessResponse(profileWithStats)

      case 'PUT':
        // Update user profile (own profile only)
        if (userId && userId !== user.id) {
          return createErrorResponse('You can only update your own profile', 403)
        }

        const {
          display_name,
          bio,
          avatar_url,
          location,
          website_url,
          social_links,
          writing_genres,
          favorite_authors,
          writing_experience,
          writing_goals,
          reading_genres,
          reading_goal_yearly,
          profile_visibility,
          show_reading_activity,
          show_writing_progress
        } = await req.json()

        const updateData: any = {}
        
        // Only update provided fields
        if (display_name !== undefined) updateData.display_name = display_name
        if (bio !== undefined) updateData.bio = bio
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url
        if (location !== undefined) updateData.location = location
        if (website_url !== undefined) updateData.website_url = website_url
        if (social_links !== undefined) updateData.social_links = social_links
        if (writing_genres !== undefined) updateData.writing_genres = writing_genres
        if (favorite_authors !== undefined) updateData.favorite_authors = favorite_authors
        if (writing_experience !== undefined) updateData.writing_experience = writing_experience
        if (writing_goals !== undefined) updateData.writing_goals = writing_goals
        if (reading_genres !== undefined) updateData.reading_genres = reading_genres
        if (reading_goal_yearly !== undefined) updateData.reading_goal_yearly = reading_goal_yearly
        if (profile_visibility !== undefined) updateData.profile_visibility = profile_visibility
        if (show_reading_activity !== undefined) updateData.show_reading_activity = show_reading_activity
        if (show_writing_progress !== undefined) updateData.show_writing_progress = show_writing_progress

        updateData.updated_at = new Date().toISOString()

        const { data: updatedProfile, error: updateError } = await supabaseClient
          .from('storyweave_profiles')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating profile:', updateError)
          return createErrorResponse('Failed to update profile')
        }

        // Log profile update activity
        await supabaseClient
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'profile_updated',
            activity_data: {
              updated_fields: Object.keys(updateData)
            },
            points_earned: 5
          })

        return createSuccessResponse(updatedProfile)

      case 'POST':
        // Special actions
        if (action === 'award_achievement') {
          // Award achievement to user (admin only - you'd need to add admin check)
          const { achievement_id, progress_data } = await req.json()

          if (!achievement_id) {
            return createErrorResponse('Achievement ID is required', 400)
          }

          // Check if user already has this achievement
          const { data: existingAchievement } = await supabaseClient
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_id', achievement_id)
            .single()

          if (existingAchievement) {
            return createErrorResponse('User already has this achievement', 400)
          }

          // Award achievement
          const { data: newAchievement, error: awardError } = await supabaseClient
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id,
              progress_data: progress_data || {},
              earned_at: new Date().toISOString()
            })
            .select(`
              *,
              achievement:achievements(*)
            `)
            .single()

          if (awardError) {
            return createErrorResponse('Failed to award achievement')
          }

          // Update user points
          const pointsReward = newAchievement.achievement.points_reward || 0
          if (pointsReward > 0) {
            await supabaseClient.rpc('add_user_points', {
              user_id: user.id,
              points: pointsReward
            })
          }

          return createSuccessResponse(newAchievement, 201)
        }

        return createErrorResponse('Invalid action', 400)

      default:
        return createErrorResponse('Method not allowed', 405)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Internal server error')
  }
})
