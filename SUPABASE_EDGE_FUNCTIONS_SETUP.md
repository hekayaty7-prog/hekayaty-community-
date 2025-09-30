# 🚀 Supabase Edge Functions Setup Guide

Your **StoryWeaveConnect** platform now has **Supabase Edge Functions** ready to deploy! These serverless functions will run on Supabase's global edge network for optimal performance.

## 📋 Prerequisites

1. **Supabase CLI** installed
2. **Docker** running (for local development)
3. **Supabase project** set up

## 🛠️ Installation Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Your Project
```bash
cd "e:\WEBSITE 2\COMMUNITY OF HEKAYATY\StoryWeaveConnect"
supabase link --project-ref YOUR_PROJECT_ID
```

### 4. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy create-discussion
supabase functions deploy upload-artwork
supabase functions deploy send-notification
supabase functions deploy process-image
supabase functions deploy get-community-stats
```

## 🎯 Complete Edge Functions Suite

### **Core Community Functions**

#### 1. **create-discussion**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/create-discussion`
- **Purpose:** Create new discussion threads with images
- **Auth:** Required
- **Payload:**
```json
{
  "title": "My Discussion",
  "content": "Discussion content...",
  "category_id": "uuid-optional",
  "images": ["url1", "url2"],
  "tags": ["tag1", "tag2"]
}
```

#### 2. **thread-comments**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/thread-comments`
- **Purpose:** Manage thread comments (CRUD)
- **Auth:** Required
- **Methods:** GET, POST, PUT, DELETE
- **Query Params:** `threadId`, `commentId`

#### 3. **upload-artwork**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/upload-artwork`
- **Purpose:** Upload and process artwork
- **Auth:** Required
- **Payload:**
```json
{
  "title": "My Artwork",
  "description": "Artwork description...",
  "image_url": "https://cloudinary.com/image.jpg",
  "tags": ["digital", "portrait"],
  "medium": "Digital Art",
  "dimensions": "1920x1080"
}
```

### **Workshop Functions**

#### 4. **workshop-management**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/workshop-management`
- **Purpose:** Create, join, leave workshops
- **Auth:** Required
- **Methods:** GET, POST, PUT
- **Actions:** `join`, `leave`, `members`

#### 5. **workshop-chat**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/workshop-chat`
- **Purpose:** Workshop messaging system
- **Auth:** Required (must be workshop member)
- **Methods:** GET, POST, DELETE
- **Query Params:** `workshopId`, `messageId`

### **Book Club Functions**

#### 6. **book-club-management**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/book-club-management`
- **Purpose:** Create, join, manage book clubs
- **Auth:** Required
- **Methods:** GET, POST, PUT
- **Actions:** `join`, `leave`, `update_book`, `members`

### **User & Profile Functions**

#### 7. **user-profile**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/user-profile`
- **Purpose:** User profile management & statistics
- **Auth:** Required
- **Methods:** GET, PUT, POST
- **Query Params:** `userId`, `action`

### **Utility Functions**

#### 8. **send-notification**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/send-notification`
- **Purpose:** Send notifications to users
- **Auth:** Required
- **Payload:**
```json
[
  {
    "user_id": "uuid",
    "type": "like",
    "title": "New Like!",
    "message": "Someone liked your post",
    "data": { "post_id": "uuid" }
  }
]
```

#### 9. **process-image**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/process-image`
- **Purpose:** Generate optimized image sizes
- **Auth:** Required
- **Payload:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "transformations": ["w_800", "h_600", "c_fill"]
}
```

#### 10. **get-community-stats**
- **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/get-community-stats`
- **Purpose:** Get community statistics (public)
- **Auth:** Not required
- **Method:** GET

## 🔧 Environment Variables

Set these in your Supabase project dashboard:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🧪 Local Development

### Start Supabase locally:
```bash
supabase start
```

### Serve functions locally:
```bash
supabase functions serve
```

### Test functions:
```bash
# Test create-discussion
curl -X POST 'http://localhost:54321/functions/v1/create-discussion' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test","content":"Test content"}'
```

## 🔄 Integration with Frontend

Update your frontend to use Edge Functions:

```typescript
// In your React components
const createDiscussion = async (data: any) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/create-discussion`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )
  
  return response.json()
}
```

## 📊 Benefits of Edge Functions

✅ **Global Performance** - Functions run close to users worldwide
✅ **Auto-scaling** - Handles traffic spikes automatically  
✅ **Cost-effective** - Pay only for execution time
✅ **Secure** - Built-in authentication and CORS handling
✅ **TypeScript Support** - Full type safety
✅ **Database Integration** - Direct access to your Supabase database

## 🚀 Production Deployment

1. **Deploy functions:** `supabase functions deploy`
2. **Set environment variables** in Supabase dashboard
3. **Update frontend** to use production URLs
4. **Test all endpoints** with production data

Your **StoryWeaveConnect** platform now has a powerful serverless backend! 🎉
