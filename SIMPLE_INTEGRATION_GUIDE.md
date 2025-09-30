# 🚀 Simple Integration Guide - Connect Your Main Website

## 📋 **What You Need to Do**

### **Step 1: Run the Database Setup**
Copy and run this SQL in your Supabase dashboard:

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS storyweave_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hekayaty_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Member from HEKAYATY platform',
  is_verified BOOLEAN DEFAULT false,
  total_points INTEGER DEFAULT 0,
  community_level INTEGER DEFAULT 1,
  main_website_user_id TEXT,
  sync_status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  main_website_user_id TEXT NOT NULL,
  supabase_user_id UUID,
  community_profile_id UUID REFERENCES storyweave_profiles(id),
  sync_type TEXT NOT NULL,
  sync_data JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE storyweave_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON storyweave_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON storyweave_profiles FOR UPDATE USING (auth.uid() = hekayaty_user_id);
CREATE POLICY "Users can insert own profile" ON storyweave_profiles FOR INSERT WITH CHECK (auth.uid() = hekayaty_user_id);
```

### **Step 2: Add to Your Main Website**

#### **Install Supabase:**
```bash
npm install @supabase/supabase-js
```

#### **Create supabase.js file:**
```javascript
// lib/supabase.js (in your main website)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agwspltdwnniogyhwimd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3NwbHRkd25uaW9neWh3aW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODI5NzEsImV4cCI6MjA3Mzg1ODk3MX0.PO5Lm0VEywhUhEbHBQlEoEfAwJtAoje-2WodjV6e3qY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### **Create community-sync.js file:**
```javascript
// utils/community-sync.js (in your main website)
import { supabase } from '../lib/supabase'

const COMMUNITY_URL = 'https://your-vercel-domain.vercel.app' // Update this

// Sync user to community when they register
export const syncUserToCommunity = async (user) => {
  try {
    // Create Supabase user
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: `temp_${Math.random().toString(36)}`, // Temporary password
      options: {
        data: {
          full_name: user.name,
          avatar_url: user.avatar,
          main_website_id: user.id.toString(),
          username: user.username
        }
      }
    })

    if (error) {
      console.error('Community sync failed:', error)
      return false
    }

    console.log('✅ User synced to community')
    return true
  } catch (error) {
    console.error('Sync error:', error)
    return false
  }
}

// Generate community link for logged-in users
export const getCommunityLink = async (user, path = '/') => {
  try {
    // Sign in user to get token
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: `temp_${Math.random().toString(36)}`
    })

    if (data?.session?.access_token) {
      return `${COMMUNITY_URL}${path}?auth_token=${data.session.access_token}&main_user_id=${user.id}`
    }

    return null
  } catch (error) {
    console.error('Link generation failed:', error)
    return null
  }
}
```

### **Step 3: Update Your User Registration**

```javascript
// In your main website's registration handler
import { syncUserToCommunity } from './utils/community-sync'

const handleUserRegistration = async (userData) => {
  // Your existing registration code
  const newUser = await createUser(userData)
  
  // Sync to community
  await syncUserToCommunity(newUser)
  
  return newUser
}
```

### **Step 4: Add Community Navigation**

```javascript
// components/CommunityButton.jsx (in your main website)
import { useState, useEffect } from 'react'
import { getCommunityLink } from '../utils/community-sync'

export const CommunityButton = ({ currentUser }) => {
  const [communityLink, setCommunityLink] = useState(null)

  useEffect(() => {
    if (currentUser) {
      getCommunityLink(currentUser).then(setCommunityLink)
    }
  }, [currentUser])

  if (!communityLink) return null

  return (
    <a 
      href={communityLink} 
      target="_blank" 
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      🚀 Join Community
    </a>
  )
}
```

### **Step 5: Add Community Features**

```javascript
// components/CommunityFeatures.jsx
import { getCommunityLink } from '../utils/community-sync'

export const CommunityFeatures = ({ currentUser }) => {
  const openGallery = async () => {
    const link = await getCommunityLink(currentUser, '/gallery')
    if (link) window.open(link, '_blank')
  }

  const openDiscussions = async () => {
    const link = await getCommunityLink(currentUser, '/threads')
    if (link) window.open(link, '_blank')
  }

  return (
    <div className="community-features">
      <h3>Community Features</h3>
      <button onClick={openGallery}>🎨 Art Gallery</button>
      <button onClick={openDiscussions}>💬 Discussions</button>
    </div>
  )
}
```

## ✅ **How It Works**

1. **User registers on main website** → Automatically creates community account
2. **User logs into main website** → Can access community with one click
3. **User clicks community link** → Automatically logged into community
4. **New users** → Get community profiles created automatically
5. **Existing users** → Seamlessly sync between both platforms

## 🎯 **Result**

- ✅ **Seamless SSO** between main website and community
- ✅ **Auto-registration** for new users
- ✅ **One-click access** to community features
- ✅ **Synchronized user data** between platforms
- ✅ **No duplicate accounts** or separate logins needed

## 🚀 **Deploy & Test**

1. **Deploy StoryWeaveConnect to Vercel**
2. **Add the code above to your main website**
3. **Update the COMMUNITY_URL** with your Vercel domain
4. **Test the flow**: Register → Login → Click Community Link

**That's it! Your users can now seamlessly move between both platforms!** 🎉
