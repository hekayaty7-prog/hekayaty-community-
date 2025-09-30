// =====================================================
// SHARED AUTH UTILITIES FOR EDGE FUNCTIONS
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function getAuthenticatedUser(req: Request) {
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
    error
  } = await supabaseClient.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabaseClient }
}

export function requireAuth(user: any) {
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
