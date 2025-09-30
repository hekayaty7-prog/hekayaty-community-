// =====================================================
// SUPABASE EDGE FUNCTION: Book Club Management
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
    const clubId = url.searchParams.get('clubId')

    switch (req.method) {
      case 'POST':
        // Create book club
        const { name, description, current_book_title, is_private = false } = await req.json()
        
        if (!name) {
          return createErrorResponse('Club name is required', 400)
        }

        const { data: bookClub, error: createError } = await supabaseClient
          .from('book_clubs')
          .insert({
            name,
            description: description || null,
            creator_id: user.id,
            current_book_title: current_book_title || null,
            is_private,
            member_count: 1,
            is_active: true,
          })
          .select(`
            *,
            creator:storyweave_profiles(username, display_name, avatar_url)
          `)
          .single()

        if (createError) {
          console.error('Error creating book club:', createError)
          return createErrorResponse('Failed to create book club')
        }

        // Add creator as first member
        await supabaseClient
          .from('book_club_members')
          .insert({
            club_id: bookClub.id,
            user_id: user.id,
            role: 'creator',
            joined_at: new Date().toISOString()
          })

        return createSuccessResponse(bookClub, 201)

      case 'PUT':
        // Join/Leave book club
        if (!clubId) {
          return createErrorResponse('Club ID is required', 400)
        }

        if (action === 'join') {
          // Check if club is private
          const { data: club } = await supabaseClient
            .from('book_clubs')
            .select('is_private')
            .eq('id', clubId)
            .single()

          if (club?.is_private) {
            return createErrorResponse('This is a private book club', 403)
          }

          // Check if already a member
          const { data: existingMember } = await supabaseClient
            .from('book_club_members')
            .select('id')
            .eq('club_id', clubId)
            .eq('user_id', user.id)
            .single()

          if (existingMember) {
            return createErrorResponse('Already a member of this book club', 400)
          }

          // Join book club
          const { data: membership, error: joinError } = await supabaseClient
            .from('book_club_members')
            .insert({
              club_id: clubId,
              user_id: user.id,
              role: 'member',
              joined_at: new Date().toISOString()
            })
            .select()
            .single()

          if (joinError) {
            return createErrorResponse('Failed to join book club')
          }

          // Update member count
          await supabaseClient.rpc('increment_book_club_members', {
            club_id: clubId
          })

          return createSuccessResponse(membership)

        } else if (action === 'leave') {
          // Leave book club
          const { error: leaveError } = await supabaseClient
            .from('book_club_members')
            .delete()
            .eq('club_id', clubId)
            .eq('user_id', user.id)

          if (leaveError) {
            return createErrorResponse('Failed to leave book club')
          }

          // Update member count
          await supabaseClient.rpc('decrement_book_club_members', {
            club_id: clubId
          })

          return createSuccessResponse({ message: 'Left book club successfully' })

        } else if (action === 'update_book') {
          // Update current book (creator only)
          const { current_book_title } = await req.json()

          // Check if user is creator
          const { data: club } = await supabaseClient
            .from('book_clubs')
            .select('creator_id')
            .eq('id', clubId)
            .single()

          if (club?.creator_id !== user.id) {
            return createErrorResponse('Only the creator can update the current book', 403)
          }

          const { data: updatedClub, error: updateError } = await supabaseClient
            .from('book_clubs')
            .update({ 
              current_book_title,
              updated_at: new Date().toISOString()
            })
            .eq('id', clubId)
            .select()
            .single()

          if (updateError) {
            return createErrorResponse('Failed to update book')
          }

          return createSuccessResponse(updatedClub)
        }

        return createErrorResponse('Invalid action', 400)

      case 'GET':
        // Get book club details or members
        if (!clubId) {
          return createErrorResponse('Club ID is required', 400)
        }

        if (action === 'members') {
          // Get book club members
          const { data: members, error: membersError } = await supabaseClient
            .from('book_club_members')
            .select(`
              *,
              user:storyweave_profiles(username, display_name, avatar_url)
            `)
            .eq('club_id', clubId)
            .order('joined_at', { ascending: true })

          if (membersError) {
            return createErrorResponse('Failed to fetch members')
          }

          return createSuccessResponse(members)
        } else {
          // Get book club details
          const { data: bookClub, error: clubError } = await supabaseClient
            .from('book_clubs')
            .select(`
              *,
              creator:storyweave_profiles(username, display_name, avatar_url)
            `)
            .eq('id', clubId)
            .single()

          if (clubError) {
            return createErrorResponse('Book club not found', 404)
          }

          return createSuccessResponse(bookClub)
        }

      default:
        return createErrorResponse('Method not allowed', 405)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Internal server error')
  }
})
