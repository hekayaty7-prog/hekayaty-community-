// =====================================================
// SUPABASE EDGE FUNCTION: Thread Comments
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
    const threadId = url.searchParams.get('threadId')
    const commentId = url.searchParams.get('commentId')

    switch (req.method) {
      case 'GET':
        // Get thread comments
        if (!threadId) {
          return createErrorResponse('Thread ID is required', 400)
        }

        const { data: comments, error: fetchError } = await supabaseClient
          .from('thread_replies')
          .select(`
            *,
            author:storyweave_profiles(username, display_name, avatar_url),
            parent_reply:thread_replies(id, content, author:storyweave_profiles(username))
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true })

        if (fetchError) {
          console.error('Error fetching comments:', fetchError)
          return createErrorResponse('Failed to fetch comments')
        }

        return createSuccessResponse(comments)

      case 'POST':
        // Create new comment
        if (!threadId) {
          return createErrorResponse('Thread ID is required', 400)
        }

        const { content, parent_reply_id } = await req.json()

        if (!content || !content.trim()) {
          return createErrorResponse('Comment content is required', 400)
        }

        // Verify thread exists
        const { data: thread } = await supabaseClient
          .from('discussion_threads')
          .select('id, is_locked')
          .eq('id', threadId)
          .single()

        if (!thread) {
          return createErrorResponse('Thread not found', 404)
        }

        if (thread.is_locked) {
          return createErrorResponse('Thread is locked for comments', 403)
        }

        // Create comment
        const { data: newComment, error: createError } = await supabaseClient
          .from('thread_replies')
          .insert({
            thread_id: threadId,
            author_id: user.id,
            parent_reply_id: parent_reply_id || null,
            content: content.trim(),
          })
          .select(`
            *,
            author:storyweave_profiles(username, display_name, avatar_url),
            parent_reply:thread_replies(id, content, author:storyweave_profiles(username))
          `)
          .single()

        if (createError) {
          console.error('Error creating comment:', createError)
          return createErrorResponse('Failed to create comment')
        }

        // Update thread reply count
        await supabaseClient.rpc('increment_thread_replies', {
          thread_id: threadId
        })

        // Update thread last activity
        await supabaseClient
          .from('discussion_threads')
          .update({ 
            last_activity_at: new Date().toISOString(),
            last_reply_at: new Date().toISOString(),
            last_reply_by: user.id
          })
          .eq('id', threadId)

        // Award points for commenting
        await supabaseClient
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'thread_comment',
            activity_data: {
              thread_id: threadId,
              comment_id: newComment.id,
              is_reply: !!parent_reply_id
            },
            points_earned: parent_reply_id ? 3 : 5 // More points for original comments
          })

        return createSuccessResponse(newComment, 201)

      case 'PUT':
        // Update comment (author only)
        if (!commentId) {
          return createErrorResponse('Comment ID is required', 400)
        }

        const { content: updatedContent } = await req.json()

        if (!updatedContent || !updatedContent.trim()) {
          return createErrorResponse('Comment content is required', 400)
        }

        // Check if user owns the comment
        const { data: existingComment } = await supabaseClient
          .from('thread_replies')
          .select('author_id, created_at')
          .eq('id', commentId)
          .single()

        if (!existingComment) {
          return createErrorResponse('Comment not found', 404)
        }

        if (existingComment.author_id !== user.id) {
          return createErrorResponse('You can only edit your own comments', 403)
        }

        // Check if comment is too old to edit (24 hours)
        const commentAge = Date.now() - new Date(existingComment.created_at).getTime()
        const maxEditTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        if (commentAge > maxEditTime) {
          return createErrorResponse('Comments can only be edited within 24 hours', 403)
        }

        const { data: updatedComment, error: updateError } = await supabaseClient
          .from('thread_replies')
          .update({ 
            content: updatedContent.trim(),
            updated_at: new Date().toISOString(),
            is_edited: true
          })
          .eq('id', commentId)
          .select(`
            *,
            author:storyweave_profiles(username, display_name, avatar_url)
          `)
          .single()

        if (updateError) {
          return createErrorResponse('Failed to update comment')
        }

        return createSuccessResponse(updatedComment)

      case 'DELETE':
        // Delete comment (author only or thread author)
        if (!commentId) {
          return createErrorResponse('Comment ID is required', 400)
        }

        // Get comment details
        const { data: commentToDelete } = await supabaseClient
          .from('thread_replies')
          .select(`
            author_id,
            thread_id,
            thread:discussion_threads(author_id)
          `)
          .eq('id', commentId)
          .single()

        if (!commentToDelete) {
          return createErrorResponse('Comment not found', 404)
        }

        // Check permissions (comment author or thread author)
        const canDelete = commentToDelete.author_id === user.id || 
                         commentToDelete.thread.author_id === user.id

        if (!canDelete) {
          return createErrorResponse('You can only delete your own comments', 403)
        }

        const { error: deleteError } = await supabaseClient
          .from('thread_replies')
          .delete()
          .eq('id', commentId)

        if (deleteError) {
          return createErrorResponse('Failed to delete comment')
        }

        // Update thread reply count
        await supabaseClient.rpc('decrement_thread_replies', {
          thread_id: commentToDelete.thread_id
        })

        return createSuccessResponse({ message: 'Comment deleted successfully' })

      default:
        return createErrorResponse('Method not allowed', 405)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return createErrorResponse('Internal server error')
  }
})
