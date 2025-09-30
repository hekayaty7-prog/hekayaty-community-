// =====================================================
// EDGE FUNCTIONS CLIENT
// =====================================================

import { supabase } from './supabase'
import { ENV } from './env'

const FUNCTIONS_URL = `${ENV.VITE_SUPABASE_URL}/functions/v1`

// Helper to make authenticated requests to Edge Functions
async function callEdgeFunction(functionName: string, options: {
  method?: string
  body?: any
  params?: Record<string, string>
} = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const url = new URL(`${FUNCTIONS_URL}/${functionName}`)
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Edge function call failed')
  }

  return response.json()
}

// =====================================================
// EDGE FUNCTION SERVICES
// =====================================================

export const EdgeFunctions = {
  // Community Stats (Public)
  getCommunityStats: async () => {
    const response = await fetch(`${FUNCTIONS_URL}/get-community-stats`)
    return response.json()
  },

  // Discussion Threads
  createDiscussion: async (data: {
    title: string
    content: string
    category_id?: string
    images?: string[]
    tags?: string[]
  }) => {
    return callEdgeFunction('create-discussion', {
      method: 'POST',
      body: data
    })
  },

  // Thread Comments
  getThreadComments: async (threadId: string) => {
    return callEdgeFunction('thread-comments', {
      params: { threadId }
    })
  },

  createComment: async (threadId: string, data: {
    content: string
    parent_reply_id?: string
  }) => {
    return callEdgeFunction('thread-comments', {
      method: 'POST',
      params: { threadId },
      body: data
    })
  },

  updateComment: async (commentId: string, content: string) => {
    return callEdgeFunction('thread-comments', {
      method: 'PUT',
      params: { commentId },
      body: { content }
    })
  },

  deleteComment: async (commentId: string) => {
    return callEdgeFunction('thread-comments', {
      method: 'DELETE',
      params: { commentId }
    })
  },

  // Artwork
  uploadArtwork: async (data: {
    title: string
    description?: string
    image_url: string
    tags?: string[]
    medium?: string
    dimensions?: string
  }) => {
    return callEdgeFunction('upload-artwork', {
      method: 'POST',
      body: data
    })
  },

  // Workshop Management
  createWorkshop: async (data: {
    title: string
    description?: string
    genre?: string
    target_words?: number
    max_participants?: number
    timeline?: string
  }) => {
    return callEdgeFunction('workshop-management', {
      method: 'POST',
      body: data
    })
  },

  joinWorkshop: async (workshopId: string) => {
    return callEdgeFunction('workshop-management', {
      method: 'PUT',
      params: { workshopId, action: 'join' }
    })
  },

  leaveWorkshop: async (workshopId: string) => {
    return callEdgeFunction('workshop-management', {
      method: 'PUT',
      params: { workshopId, action: 'leave' }
    })
  },

  getWorkshopMembers: async (workshopId: string) => {
    return callEdgeFunction('workshop-management', {
      params: { workshopId, action: 'members' }
    })
  },

  // Workshop Chat
  getWorkshopMessages: async (workshopId: string) => {
    return callEdgeFunction('workshop-chat', {
      params: { workshopId }
    })
  },

  sendWorkshopMessage: async (workshopId: string, message: string) => {
    return callEdgeFunction('workshop-chat', {
      method: 'POST',
      params: { workshopId },
      body: { message }
    })
  },

  // Book Club Management
  createBookClub: async (data: {
    name: string
    description?: string
    current_book_title?: string
    is_private?: boolean
  }) => {
    return callEdgeFunction('book-club-management', {
      method: 'POST',
      body: data
    })
  },

  joinBookClub: async (clubId: string) => {
    return callEdgeFunction('book-club-management', {
      method: 'PUT',
      params: { clubId, action: 'join' }
    })
  },

  // User Profile
  getUserProfile: async (userId?: string) => {
    return callEdgeFunction('user-profile', {
      params: userId ? { userId } : {}
    })
  },

  updateUserProfile: async (data: any) => {
    return callEdgeFunction('user-profile', {
      method: 'PUT',
      body: data
    })
  },

  // Notifications
  sendNotifications: async (notifications: Array<{
    user_id: string
    type: string
    title: string
    message: string
    data?: any
  }>) => {
    return callEdgeFunction('send-notification', {
      method: 'POST',
      body: notifications
    })
  },

  // Image Processing
  processImage: async (imageUrl: string, transformations?: string[]) => {
    return callEdgeFunction('process-image', {
      method: 'POST',
      body: { image_url: imageUrl, transformations }
    })
  }
}
