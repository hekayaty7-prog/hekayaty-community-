// =====================================================
// SUPABASE CLIENT CONFIGURATION
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { ENV } from './env'

// Get environment variables
const supabaseUrl = ENV.VITE_SUPABASE_URL
const supabaseAnonKey = ENV.VITE_SUPABASE_ANON_KEY

console.log('✅ Supabase configuration loaded:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
})

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connected successfully!')
    return { success: true, data }
  } catch (error) {
    console.error('Connection test failed:', error)
    return { success: false, error: String(error) }
  }
}

// Get current user profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  return profile
}

// Create user profile
export async function createUserProfile(userData: {
  hekayaty_user_id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([userData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }
  
  return data
}

// =====================================================
// CLOUDINARY INTEGRATION
// =====================================================

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', ENV.VITE_CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', ENV.VITE_CLOUDINARY_FOLDER)
  
  const cloudName = ENV.VITE_CLOUDINARY_CLOUD_NAME
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary')
  }
  
  const data = await response.json()
  return data.secure_url
}

// =====================================================
// ARTWORK FUNCTIONS
// =====================================================

export async function uploadArtwork(artworkData: {
  title: string
  description?: string
  artist_id: string
  category_id?: string
  image_file: File
  tags?: string[]
}) {
  try {
    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(artworkData.image_file)
    
    // Save artwork metadata to Supabase
    const { data, error } = await supabase
      .from('artworks')
      .insert([{
        title: artworkData.title,
        description: artworkData.description,
        artist_id: artworkData.artist_id,
        category_id: artworkData.category_id,
        image_url: imageUrl,
        tags: artworkData.tags || []
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error uploading artwork:', error)
    throw error
  }
}

// Get artworks
export async function getArtworks(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artist:user_profiles(username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data
}

// =====================================================
// DISCUSSION FUNCTIONS
// =====================================================

export async function getDiscussionThreads(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('discussion_threads')
    .select(`
      *,
      author:user_profiles(username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data
}

export async function createDiscussionThread(threadData: {
  title: string
  content: string
  author_id: string
  category_id?: string
  tags?: string[]
  images?: string[]
}) {
  const { data, error } = await supabase
    .from('discussion_threads')
    .insert([threadData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// WORKSHOP FUNCTIONS
// =====================================================

export async function getWorkshops(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('workshops')
    .select(`
      *,
      creator:user_profiles(username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data
}

export async function getWorkshop(id: string) {
  const { data, error } = await supabase
    .from('workshops')
    .select(`
      *,
      creator:user_profiles(username, display_name, avatar_url)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createWorkshop(workshopData: {
  title: string
  description?: string
  creator_id: string
  genre?: string
  target_words?: number
  max_participants?: number
  timeline?: string
}) {
  const { data, error } = await supabase
    .from('workshops')
    .insert([{
      title: workshopData.title,
      description: workshopData.description,
      creator_id: workshopData.creator_id,
      genre: workshopData.genre,
      target_words: workshopData.target_words,
      max_participants: null,
      timeline: workshopData.timeline || '6 months',
      status: 'recruiting',
      current_participants: 1 // Creator is the first participant
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// WORKSHOP MEMBERSHIP FUNCTIONS
// =====================================================

export async function joinWorkshop(workshopId: string, userId: string) {
  const { data, error } = await supabase
    .from('workshop_members')
    .insert([{
      workshop_id: workshopId,
      user_id: userId,
      role: 'member'
    }])
    .select()
    .single()
  
  if (error) throw error
  
  // Update participant count
  const { error: updateError } = await supabase
    .rpc('increment_workshop_participants', { workshop_id: workshopId })
  
  if (updateError) console.warn('Failed to update participant count:', updateError)
  
  return data
}

export async function leaveWorkshop(workshopId: string, userId: string) {
  const { error } = await supabase
    .from('workshop_members')
    .delete()
    .eq('workshop_id', workshopId)
    .eq('user_id', userId)
  
  if (error) throw error
  
  // Update participant count
  const { error: updateError } = await supabase
    .rpc('decrement_workshop_participants', { workshop_id: workshopId })
  
  if (updateError) console.warn('Failed to update participant count:', updateError)
}

export async function getWorkshopMembers(workshopId: string) {
  const { data, error } = await supabase
    .from('workshop_members')
    .select(`
      *
    `)
    .eq('workshop_id', workshopId)
    .order('joined_at', { ascending: true })
  
  if (error) throw error
  
  // Manually fetch user profiles for each member
  if (data && data.length > 0) {
    const userIds = data.map(member => member.user_id);
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url')
      .in('user_id', userIds);
    
    // Combine the data
    return data.map(member => ({
      ...member,
      user: profiles?.find(profile => profile.user_id === member.user_id) || null
    }));
  }
  
  return data
}

export async function isWorkshopMember(workshopId: string, userId: string) {
  const { data, error } = await supabase
    .from('workshop_members')
    .select('id')
    .eq('workshop_id', workshopId)
    .eq('user_id', userId)
    .single()
  
  return !error && !!data
}

// =====================================================
// WORKSHOP CHAT FUNCTIONS
// =====================================================

export async function getWorkshopMessages(workshopId: string) {
  const { data, error } = await supabase
    .from('workshop_messages')
    .select(`
      *
    `)
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  // Manually fetch user profiles for each message
  if (data && data.length > 0) {
    const userIds = Array.from(new Set(data.map(msg => msg.user_id))); // Remove duplicates
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, avatar_url')
      .in('user_id', userIds);
    
    // Combine the data
    return data.map(msg => ({
      ...msg,
      user: profiles?.find(profile => profile.user_id === msg.user_id) || null
    }));
  }
  
  return data
}

export async function sendWorkshopMessage(workshopId: string, userId: string, message: string) {
  const { data, error } = await supabase
    .from('workshop_messages')
    .insert([{
      workshop_id: workshopId,
      user_id: userId,
      message: message.trim()
    }])
    .select(`*`)
    .single()
  
  if (error) throw error
  
  // Fetch user profile separately
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, username, display_name, avatar_url')
    .eq('user_id', userId)
    .single()
  
  return {
    ...data,
    user: profile
  }
}

// =====================================================
// BOOK CLUB FUNCTIONS
// =====================================================

export async function getBookClubs(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('book_clubs')
    .select(`
      *,
      creator:user_profiles(username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data
}

export async function createBookClub(clubData: {
  name: string
  description?: string
  creator_id: string
  current_book_title?: string
  is_private?: boolean
}) {
  const { data, error } = await supabase
    .from('book_clubs')
    .insert([{
      name: clubData.name,
      description: clubData.description,
      creator_id: clubData.creator_id,
      current_book_title: clubData.current_book_title,
      is_private: clubData.is_private || false,
      status: 'active',
      current_member_count: 1 // Creator is the first member
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export default supabase
