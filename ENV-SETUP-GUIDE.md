# Environment Setup Guide

This guide will help you set up all the necessary environment variables for StoryWeaveConnect with Supabase and Cloudinary integration.

## 📁 Environment Files Created

- `.env.example` - Template with all variables and descriptions
- `.env.local` - Local development configuration
- `.env.production` - Production configuration
- `supabase/functions/_shared/env.ts` - Edge Functions environment config

## 🚀 Quick Setup

### 1. Copy Environment File
```bash
# Copy the example file to create your local environment
cp .env.example .env
```

### 2. Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy these values to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Set Up Cloudinary

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here
```

3. Create an upload preset:
   - Go to **Settings → Upload**
   - Click **Add upload preset**
   - Name it `storyweave_uploads`
   - Set **Signing Mode** to "Unsigned"
   - Set **Folder** to `storyweave`

### 4. Configure HEKAYATY Integration

```env
HEKAYATY_API_URL=https://api.hekayaty.com
HEKAYATY_API_KEY=your-hekayaty-api-key
HEKAYATY_JWT_SECRET=your-hekayaty-jwt-secret
HEKAYATY_USER_SERVICE_URL=https://users.hekayaty.com
```

## 🔧 Supabase Edge Functions Setup

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
supabase link --project-ref your-project-id
```

### 4. Set Edge Function Environment Variables
```bash
# Set environment variables for Edge Functions
supabase secrets set CLOUDINARY_CLOUD_NAME=your-cloud-name
supabase secrets set CLOUDINARY_API_KEY=your-api-key
supabase secrets set CLOUDINARY_API_SECRET=your-api-secret
supabase secrets set HEKAYATY_API_KEY=your-hekayaty-key
supabase secrets set HEKAYATY_JWT_SECRET=your-jwt-secret
```

## 📝 Environment Variables Explained

### 🔐 Supabase Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL (public)
- `VITE_SUPABASE_ANON_KEY` - Public API key for client-side (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Private key for server operations (secret)
- `SUPABASE_JWT_SECRET` - JWT signing secret (secret)

### 🖼️ Cloudinary Variables
- `VITE_CLOUDINARY_CLOUD_NAME` - Your cloud name (public)
- `VITE_CLOUDINARY_API_KEY` - API key (public)
- `CLOUDINARY_API_SECRET` - API secret (secret)
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Upload preset name (public)
- `VITE_CLOUDINARY_FOLDER` - Folder for organizing uploads (public)

### 🏢 HEKAYATY Variables
- `HEKAYATY_API_URL` - Main HEKAYATY API endpoint
- `HEKAYATY_API_KEY` - API key for server-to-server communication
- `HEKAYATY_JWT_SECRET` - JWT secret for token verification
- `HEKAYATY_USER_SERVICE_URL` - User service endpoint

## 🔒 Security Best Practices

### Public vs Private Variables
- **Public** (`VITE_` prefix): Safe to expose to client-side code
- **Private** (no prefix): Server-side only, never expose to client

### Environment-Specific Files
- `.env.local` - Local development (not committed)
- `.env.production` - Production values (not committed)
- `.env.example` - Template (committed to git)

### Git Security
The `.gitignore` file is configured to exclude all `.env*` files except `.env.example`.

## 🧪 Testing Your Setup

### 1. Test Supabase Connection
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test connection
const { data, error } = await supabase.from('storyweave_profiles').select('count')
console.log('Supabase connected:', !error)
```

### 2. Test Cloudinary Upload
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
formData.append('folder', import.meta.env.VITE_CLOUDINARY_FOLDER)

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: 'POST', body: formData }
)
```

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key"** - Check your Supabase/Cloudinary credentials
2. **CORS errors** - Ensure your domain is added to Supabase allowed origins
3. **Upload preset not found** - Create the upload preset in Cloudinary dashboard
4. **Environment variables not loading** - Restart your development server

### Debug Commands
```bash
# Check if environment variables are loaded
echo $VITE_SUPABASE_URL

# Test Supabase connection
supabase status

# List Edge Function secrets
supabase secrets list
```

## 📚 Next Steps

After setting up environment variables:

1. **Run the database schema**: Use `complete-schema.sql`
2. **Enable RLS**: Run `enable-rls.sql`
3. **Deploy Edge Functions**: `supabase functions deploy`
4. **Test file uploads**: Use the art gallery upload feature
5. **Configure HEKAYATY integration**: Set up user authentication flow

## 🆘 Need Help?

If you encounter issues:
1. Check the Supabase dashboard for error logs
2. Verify all environment variables are set correctly
3. Ensure your Cloudinary upload preset is configured
4. Test API connections individually

Remember: Never commit actual environment values to git!
