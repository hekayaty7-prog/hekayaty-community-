# 🔐 HEKAYATY → StoryWeaveConnect SSO Integration

## 🚀 **Vercel Deployment Setup**

### **1. Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd "E:\WEBSITE 2\COMMUNITY OF HEKAYATY\StoryWeaveConnect"
vercel

# Follow prompts:
# - Project name: storyweave-connect
# - Framework: Other
# - Build command: npm run vercel-build
# - Output directory: client/dist
```

### **2. Environment Variables in Vercel**
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (Same as your main HEKAYATY website)
VITE_SUPABASE_URL=https://agwspltdwnniogyhwimd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=ddlakf6mp
VITE_CLOUDINARY_API_KEY=645285537343542
VITE_CLOUDINARY_UPLOAD_PRESET=storyweave_uploads

# Production URLs
VITE_APP_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### **3. Custom Domain Setup**
In Vercel Dashboard → Domains:
- Add: `community.hekayaty.com`
- Point DNS: `CNAME community.hekayaty.com → your-vercel-domain.vercel.app`

---

## 🔗 **Main HEKAYATY Website Integration**

### **Step 1: Install Supabase in Main Website**
```bash
# In your main HEKAYATY website
npm install @supabase/supabase-js
```

### **Step 2: Shared Supabase Configuration**
```typescript
// lib/supabase.ts (in your main HEKAYATY website)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agwspltdwnniogyhwimd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Step 3: SSO Utilities for Main Website**
```typescript
// utils/communitySSO.ts (in your main HEKAYATY website)
import { supabase } from '../lib/supabase'

const COMMUNITY_URL = 'https://community.hekayaty.com'

/**
 * Generate authenticated link to community
 */
export const generateCommunityLink = async (path: string = '/') => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      console.log('No active session - redirect to login first')
      return null
    }

    // Create authenticated community link
    const communityUrl = new URL(COMMUNITY_URL + path)
    communityUrl.searchParams.set('auth_token', session.access_token)
    
    return communityUrl.toString()
  } catch (error) {
    console.error('Error generating community link:', error)
    return null
  }
}

/**
 * Check if user has community access
 */
export const hasCommunitAccess = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session?.user
  } catch (error) {
    return false
  }
}

/**
 * Redirect to community with authentication
 */
export const redirectToCommunity = async (path: string = '/') => {
  const link = await generateCommunityLink(path)
  if (link) {
    window.location.href = link
  } else {
    // Redirect to login first
    window.location.href = '/login?redirect=community'
  }
}
```

### **Step 4: Add Community Navigation to Main Website**
```typescript
// components/Navigation.tsx (in your main HEKAYATY website)
import { useState, useEffect } from 'react'
import { hasCommunitAccess, redirectToCommunity } from '../utils/communitySSO'

export const Navigation = () => {
  const [showCommunity, setShowCommunity] = useState(false)

  useEffect(() => {
    hasCommunitAccess().then(setShowCommunity)
  }, [])

  const handleCommunityClick = () => {
    redirectToCommunity('/')
  }

  const handleGalleryClick = () => {
    redirectToCommunity('/gallery')
  }

  const handleDiscussionsClick = () => {
    redirectToCommunity('/threads')
  }

  return (
    <nav className="main-navigation">
      {/* Your existing navigation */}
      
      {showCommunity && (
        <div className="community-nav">
          <button onClick={handleCommunityClick} className="nav-link">
            🚀 Community
          </button>
          
          <div className="dropdown">
            <button onClick={handleGalleryClick}>🎨 Art Gallery</button>
            <button onClick={handleDiscussionsClick}>💬 Discussions</button>
          </div>
        </div>
      )}
    </nav>
  )
}
```

### **Step 5: User Profile Integration**
```typescript
// components/UserProfile.tsx (in your main HEKAYATY website)
import { generateCommunityLink } from '../utils/communitySSO'

export const UserProfile = ({ user }) => {
  const handleViewCommunityProfile = async () => {
    const link = await generateCommunityLink('/profile')
    if (link) window.open(link, '_blank')
  }

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      
      {/* Community Integration */}
      <div className="community-section">
        <h3>Community Activity</h3>
        <button onClick={handleViewCommunityProfile}>
          View Community Profile
        </button>
      </div>
    </div>
  )
}
```

---

## 🗄️ **Database Setup**

### **Required Table in Supabase**
```sql
-- Create community profiles table
CREATE TABLE IF NOT EXISTS storyweave_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hekayaty_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'New member from HEKAYATY',
  is_verified BOOLEAN DEFAULT false,
  total_points INTEGER DEFAULT 0,
  community_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE storyweave_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON storyweave_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON storyweave_profiles
  FOR UPDATE USING (auth.uid() = hekayaty_user_id);

CREATE POLICY "Users can insert own profile" ON storyweave_profiles
  FOR INSERT WITH CHECK (auth.uid() = hekayaty_user_id);
```

---

## 🔄 **How SSO Works**

### **Flow Diagram:**
```
HEKAYATY Main Website → StoryWeaveConnect Community

1. User logs into HEKAYATY ✅
2. User clicks "Community" link 🔗
3. Main website generates auth token 🎫
4. Redirects to: community.hekayaty.com?auth_token=xxx 🚀
5. Community detects token & authenticates user ✨
6. Community creates profile if new user 👤
7. User is fully authenticated in community! 🎉
```

### **Automatic Features:**
- ✅ **Auto-login**: Users don't need to sign up again
- ✅ **Profile sync**: Basic info copied from main website
- ✅ **Real-time sync**: Changes reflect across platforms
- ✅ **Seamless navigation**: One-click access to community

---

## 🚀 **Deployment Checklist**

### **Vercel Deployment:**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure custom domain: `community.hekayaty.com`
- [ ] Test deployment

### **Main Website Integration:**
- [ ] Install Supabase in main website
- [ ] Add SSO utilities
- [ ] Update navigation with community links
- [ ] Test SSO flow

### **Database Setup:**
- [ ] Create `storyweave_profiles` table
- [ ] Set up RLS policies
- [ ] Test profile creation

### **Domain Configuration:**
- [ ] Point `community.hekayaty.com` to Vercel
- [ ] Update CORS settings in Supabase
- [ ] Test cross-domain authentication

---

## 🎯 **Ready to Deploy!**

Your StoryWeaveConnect community is now ready for production deployment with full SSO integration to your main HEKAYATY website!

**Next Steps:**
1. Deploy to Vercel using the configuration above
2. Add the SSO code to your main HEKAYATY website
3. Create the database table in Supabase
4. Test the complete flow

**Need help with any specific step?** 🚀
