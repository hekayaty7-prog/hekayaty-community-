# 🚀 **Complete Setup Guide - HEKAYATY + StoryWeaveConnect Integration**

## ✅ **What We Built**

A **seamless integration** where users from your main HEKAYATY website automatically get community accounts and can access StoryWeaveConnect with one click!

---

## 🔧 **Step 1: Setup StoryWeaveConnect Database**

Run this SQL in your **StoryWeaveConnect Supabase** dashboard:

```sql
-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Welcome to the community!',
  hekayaty_user_id TEXT, -- Links to main website user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
```

---

## 🌐 **Step 2: Deploy StoryWeaveConnect**

### **Deploy to Vercel:**
```bash
cd "E:\WEBSITE 2\COMMUNITY OF HEKAYATY\StoryWeaveConnect"
npm install -g vercel
vercel
```

### **Set Environment Variables in Vercel:**
```
VITE_SUPABASE_URL = https://agwspltdwnniogyhwimd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET = m/sGOIwDjeqvMCX7Q83M/Ftpo7CIkqnP8cGj8I/By7jiPQQlbeOaqKl8ckzzj23fdd3+jB1YbANwea6TzNQeuw==
NODE_ENV = production
```

---

## 🏠 **Step 3: Add Integration to HEKAYATY Website**

### **Copy the integration file:**
Copy `integration/hekayaty-integration.js` to your main HEKAYATY website.

### **Update the URLs:**
```javascript
// In hekayaty-integration.js, update these:
const COMMUNITY_API_URL = 'https://your-vercel-domain.vercel.app/api/auth';
const COMMUNITY_URL = 'https://your-vercel-domain.vercel.app';
```

### **Add to your user registration:**
```javascript
import { createCommunityAccount } from './path/to/hekayaty-integration.js';

const handleUserRegistration = async (userData) => {
  // Your existing registration
  const newUser = await registerUser(userData);
  
  // Create community account automatically
  await createCommunityAccount(newUser);
  
  return newUser;
};
```

### **Add community button to your UI:**
```javascript
import { CommunityAccessButton } from './path/to/hekayaty-integration.js';

// In your component
<CommunityAccessButton currentUser={currentUser} />
```

---

## 🎯 **How It Works**

### **User Registration Flow:**
```
1. User registers on HEKAYATY ✅
2. HEKAYATY calls StoryWeaveConnect API 🔄
3. Community account created automatically ✨
4. User can now access community! 🚀
```

### **Community Access Flow:**
```
1. User clicks "Community" button on HEKAYATY 🖱️
2. HEKAYATY generates secure token 🎫
3. Redirects to: community.com?auth_token=xxx 🔗
4. StoryWeaveConnect verifies token ✅
5. User is automatically logged in! 🎉
```

---

## 🧪 **Testing the Integration**

### **Test 1: User Registration**
1. Register a new user on HEKAYATY
2. Check StoryWeaveConnect database - should see new user in `user_profiles`
3. ✅ Success if user appears in both systems

### **Test 2: Community Access**
1. Login to HEKAYATY with existing user
2. Click community button
3. Should open StoryWeaveConnect and be logged in
4. ✅ Success if user can create posts, view gallery, etc.

### **Test 3: Cross-Platform Features**
1. Create a post in StoryWeaveConnect
2. Upload artwork to gallery
3. Join discussions
4. ✅ Success if all features work normally

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **"User not found in community"**
- User wasn't created during registration
- Check HEKAYATY integration code is calling `createCommunityAccount`

#### **"Invalid token"**
- Token expired (24 hours)
- Check API URLs are correct
- Verify environment variables

#### **"Network error"**
- StoryWeaveConnect not deployed properly
- Check Vercel deployment status
- Verify API endpoints are working

### **Debug Steps:**
1. Check browser console for errors
2. Check Vercel function logs
3. Check Supabase logs
4. Test API endpoints directly

---

## 🎉 **Success Indicators**

✅ **Users can register once and access both platforms**  
✅ **One-click community access from HEKAYATY**  
✅ **No duplicate accounts or separate logins**  
✅ **All community features work normally**  
✅ **Seamless user experience across platforms**  

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all URLs and environment variables
3. Test each step individually
4. Check that both databases are accessible

**The integration is now complete and ready for production use!** 🚀
