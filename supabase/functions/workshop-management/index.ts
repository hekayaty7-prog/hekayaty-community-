// =====================================================
// SUPABASE EDGE FUNCTION: Workshop Management
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
    const action = url.searchParams.get('action')
    const workshopId = url.searchParams.get('workshopId')

    switch (req.method) {
      case 'POST':
        // Create workshop
        const { title, description, genre, target_words, max_participants, timeline } = await req.json()
        
        if (!title) {
          return createErrorResponse('Title is required', 400)
        }

        const { data: workshop, error: createError } = await supabaseClient
          .from('workshops')
          .insert({
            title,
            description: description || null,
            creator_id: user.id,
            genre: genre || null,
            target_words: target_words || 1000,
            max_participants: max_participants || 10,
            timeline: timeline || null,
            current_participants: 1,
            is_active: true,
          })
          .select(`
            *,
            creator:storyweave_profiles(username, display_name, avatar_url)
          `)
          .single()

        if (createError) {
          console.error('Error creating workshop:', createError)
          return createErrorResponse('Failed to create workshop')
        }

        // Add creator as first member
        await supabaseClient
          .from('workshop_members')
          .insert({
            workshop_id: workshop.id,
            user_id: user.id,
            role: 'creator',
            joined_at: new Date().toISOString()
          })

        return createSuccessResponse(workshop, 201)

      case 'PUT':
        // Join/Leave workshop
        if (!workshopId) {
          return createErrorResponse('Workshop ID is required', 400)
        }

        if (action === 'join') {
          // Check if already a member
          const { data: existingMember } = await supabaseClient
            .from('workshop_members')
            .select('id')
            .eq('workshop_id', workshopId)
            .eq('user_id', user.id)
            .single()

          if (existingMember) {
            return createErrorResponse('Already a member of this workshop', 400)
          }

          // Join workshop
          const { data: membership, error: joinError } = await supabaseClient
            .from('workshop_members')
            .insert({
              workshop_id: workshopId,
              user_id: user.id,
              role: 'member',
              joined_at: new Date().toISOString()
            })
            .select()
            .single()

          if (joinError) {
            return createErrorResponse('Failed to join workshop')
          }

          // Update participant count
          await supabaseClient.rpc('increment_workshop_participants', {
            workshop_id: workshopId
          })

          return createSuccessResponse(membership)

        } else if (action === 'leave') {
          // Leave workshop
          const { error: leaveError } = await supabaseClient
            .from('workshop_members')
            .delete()
            .eq('workshop_id', workshopId)
            .eq('user_id', user.id)

          if (leaveError) {
            return createErrorResponse('Failed to leave workshop')
          }

          // Update participant count
          await supabaseClient.rpc('decrement_workshop_participants', {
            workshop_id: workshopId
          })

          return createSuccessResponse({ message: 'Left workshop successfully' })
        }

        return createErrorResponse('Invalid action', 400)

      case 'GET':
        // Get workshop details or members
        if (!workshopId) {
          return createErrorResponse('Workshop ID is required', 400)
        }

        if (action === 'members') {
          // Get workshop members
          const { data: members, error: membersError } = await supabaseClient
            .from('workshop_members')
            .select(`
              *,
              user:storyweave_profiles(username, display_name, avatar_url)
            `)
            .eq('workshop_id', workshopId)
            .order('joined_at', { ascending: true })

          if (membersError) {
            return createErrorResponse('Failed to fetch members')
          }

          return createSuccessResponse(members)
        } else {
          // Get workshop details
          const { data: workshop, error: workshopError } = await supabaseClient
            .from('workshops')
            .select(`
              *,
              creator:storyweave_profiles(username, display_name, avatar_url)
            `)
            .eq('id', workshopId)
            .single()

          if (workshopError) {
            return createErrorResponse('Workshop not found', 404)
          }

          return createSuccessResponse(workshop)
        }

      default:
        return createErrorResponse('Method not allowed', 405)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Internal server error')
  }
})
