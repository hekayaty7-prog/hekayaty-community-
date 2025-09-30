// =====================================================
// SIMPLE AUTH FOR MAIN HEKAYATY WEBSITE
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Use SAME Supabase project as StoryWeaveConnect
const supabase = createClient(
  'https://agwspltdwnniogyhwimd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY'
)

// =====================================================
// REPLACE YOUR CURRENT SIGN UP FUNCTION WITH THIS
// =====================================================
export const signUpUser = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: userData.name,
          username: userData.username,
          avatar_url: userData.avatar || null
        }
      }
    })

    if (error) throw error

    console.log('✅ User signed up on both websites!')
    return { success: true, user: data.user }
  } catch (error) {
    console.error('❌ Sign up failed:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// REPLACE YOUR CURRENT SIGN IN FUNCTION WITH THIS
// =====================================================
export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) throw error

    console.log('✅ User signed in on both websites!')
    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('❌ Sign in failed:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// GET CURRENT USER
// =====================================================
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('❌ Get user failed:', error)
    return null
  }
}

// =====================================================
// SIGN OUT FROM BOTH WEBSITES
// =====================================================
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    console.log('✅ User signed out from both websites!')
    return { success: true }
  } catch (error) {
    console.error('❌ Sign out failed:', error)
    return { success: false, error: error.message }
  }
}

// =====================================================
// GENERATE COMMUNITY LINK (ONE-CLICK ACCESS)
// =====================================================
export const getCommunityLink = async (path = '/') => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return null // User not logged in
    }

    // Your community URL (update this after Vercel deployment)
    const communityUrl = 'https://your-vercel-domain.vercel.app'
    
    // Since both sites use same Supabase, user will be auto-logged in!
    return `${communityUrl}${path}`
  } catch (error) {
    console.error('❌ Community link failed:', error)
    return null
  }
}

// =====================================================
// EXAMPLE: HOW TO USE IN YOUR COMPONENTS
// =====================================================

/*
// Example: Registration Form
const handleRegister = async (formData) => {
  const result = await signUpUser(
    formData.email, 
    formData.password, 
    {
      name: formData.name,
      username: formData.username,
      avatar: formData.avatar
    }
  )
  
  if (result.success) {
    alert('Account created! You can now access the community too!')
  }
}

// Example: Login Form  
const handleLogin = async (email, password) => {
  const result = await signInUser(email, password)
  
  if (result.success) {
    alert('Welcome back! Community access is ready!')
  }
}

// Example: Community Button
const CommunityButton = () => {
  const [communityLink, setCommunityLink] = useState(null)
  
  useEffect(() => {
    getCommunityLink().then(setCommunityLink)
  }, [])

  if (!communityLink) return null

  return (
    <a href={communityLink} target="_blank">
      🚀 Open Community
    </a>
  )
}
*/
