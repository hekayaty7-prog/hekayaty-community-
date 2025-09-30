// =====================================================
// SUPABASE EDGE FUNCTION: Workshop Chat
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
    const workshopId = url.searchParams.get('workshopId')

    if (!workshopId) {
      return createErrorResponse('Workshop ID is required', 400)
    }

    // Verify user is a member of the workshop
    const { data: membership } = await supabaseClient
      .from('workshop_members')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return createErrorResponse('You must be a workshop member to access chat', 403)
    }

    switch (req.method) {
      case 'GET':
        // Get workshop messages
        const { data: messages, error: messagesError } = await supabaseClient
          .from('workshop_messages')
          .select(`
            *,
            sender:storyweave_profiles(username, display_name, avatar_url)
          `)
          .eq('workshop_id', workshopId)
          .order('created_at', { ascending: true })
          .limit(100)

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
          return createErrorResponse('Failed to fetch messages')
        }

        return createSuccessResponse(messages)

      case 'POST':
        // Send message
        const { message, message_type = 'text' } = await req.json()

        if (!message || !message.trim()) {
          return createErrorResponse('Message content is required', 400)
        }

        const { data: newMessage, error: sendError } = await supabaseClient
          .from('workshop_messages')
          .insert({
            workshop_id: workshopId,
            sender_id: user.id,
            message: message.trim(),
            message_type,
          })
          .select(`
            *,
            sender:storyweave_profiles(username, display_name, avatar_url)
          `)
          .single()

        if (sendError) {
          console.error('Error sending message:', sendError)
          return createErrorResponse('Failed to send message')
        }

        // Update last activity
        await supabaseClient
          .from('workshops')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', workshopId)

        // Award points for participation
        await supabaseClient
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'workshop_message',
            activity_data: {
              workshop_id: workshopId,
              message_id: newMessage.id
            },
            points_earned: 2
          })

        return createSuccessResponse(newMessage, 201)

      case 'DELETE':
        // Delete message (only sender or workshop creator)
        const messageId = url.searchParams.get('messageId')
        
        if (!messageId) {
          return createErrorResponse('Message ID is required', 400)
        }

        // Check if user can delete this message
        const { data: messageToDelete } = await supabaseClient
          .from('workshop_messages')
          .select('sender_id, workshop:workshops(creator_id)')
          .eq('id', messageId)
          .single()

        if (!messageToDelete) {
          return createErrorResponse('Message not found', 404)
        }

        const canDelete = messageToDelete.sender_id === user.id || 
                         messageToDelete.workshop.creator_id === user.id

        if (!canDelete) {
          return createErrorResponse('You can only delete your own messages', 403)
        }

        const { error: deleteError } = await supabaseClient
          .from('workshop_messages')
          .delete()
          .eq('id', messageId)

        if (deleteError) {
          return createErrorResponse('Failed to delete message')
        }

        return createSuccessResponse({ message: 'Message deleted successfully' })

      default:
        return createErrorResponse('Method not allowed', 405)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Internal server error')
  }
})
