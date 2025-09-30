# StoryWeaveConnect Database Schema

This directory contains the complete Supabase database schema for the HEKAYATY StoryWeaveConnect platform.

## Quick Setup

**Run this single file to create the entire database:**
```sql
-- Run this file in your Supabase SQL editor
\i complete-schema.sql
```

## File Structure

### Core Files (Run in Order)
1. `complete-schema.sql` - **Main file with all tables and initial data**
2. `01-core-schema.sql` - User profiles and achievements
3. `02-writing-workshops.sql` - Workshop system
4. `03-book-clubs.sql` - Book club features
5. `04-community-discussions.sql` - Discussion threads
6. `05-art-gallery-fixed.sql` - Art gallery (fixed version)
7. `06-messaging-notifications.sql` - Messaging system
8. `07-indexes-triggers.sql` - Performance indexes
9. `08-rls-policies.sql` - Row Level Security

### Fixed Issues
- ✅ Fixed `DATE()` function in UNIQUE constraints
- ✅ Resolved table dependency order
- ✅ Added proper foreign key references
- ✅ Corrected syntax errors

## Database Features

### 🔐 Authentication Integration
- Integrates with HEKAYATY's existing user system
- Uses `hekayaty_user_id` to link profiles
- Row Level Security (RLS) policies for data protection

### 📚 Core Features
- **User Profiles**: Extended profiles with writing/reading preferences
- **Writing Workshops**: Collaborative writing with feedback system
- **Book Clubs**: Reading progress tracking and discussions
- **Art Gallery**: Image uploads with categories and reactions
- **Community Discussions**: Threaded conversations with voting
- **Messaging**: Direct messages and notifications
- **Achievements**: Badge system with points and levels

### 🚀 Performance
- Optimized indexes for fast queries
- Materialized paths for threaded comments
- Efficient JSONB storage for flexible data
- Proper constraints and data validation

## Integration with HEKAYATY

### User Authentication
```sql
-- Users are linked via hekayaty_user_id
CREATE TABLE public.storyweave_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hekayaty_user_id VARCHAR(255) UNIQUE NOT NULL,
    -- ... other fields
);
```

### RLS Helper Functions
```sql
-- Get current user from HEKAYATY session
CREATE OR REPLACE FUNCTION get_current_storyweave_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id 
        FROM public.storyweave_profiles 
        WHERE hekayaty_user_id = current_setting('app.current_user_id', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Common Operations

### Create a New User Profile
```sql
INSERT INTO public.storyweave_profiles (
    hekayaty_user_id, 
    username, 
    display_name
) VALUES (
    'hekayaty_user_123',
    'writer_jane',
    'Jane Smith'
);
```

### Create a Writing Workshop
```sql
INSERT INTO public.workshops (
    title,
    description,
    creator_id,
    max_participants
) VALUES (
    'Fantasy Novel Writing',
    'A 12-week workshop for fantasy writers',
    (SELECT id FROM public.storyweave_profiles WHERE username = 'writer_jane'),
    15
);
```

### Upload Artwork
```sql
INSERT INTO public.artworks (
    title,
    description,
    artist_id,
    category_id,
    image_url
) VALUES (
    'Dragon Book Cover',
    'Fantasy book cover design',
    (SELECT id FROM public.storyweave_profiles WHERE username = 'artist_bob'),
    (SELECT id FROM public.art_categories WHERE name = 'Book Covers'),
    'https://storage.supabase.co/artwork/dragon-cover.jpg'
);
```

## Troubleshooting

### Common Errors Fixed
1. **Syntax Error with DATE()**: Replaced with `view_date` column
2. **Missing Table References**: Proper dependency order in complete-schema.sql
3. **Foreign Key Errors**: All references point to existing tables

### If You Get Errors
1. Drop all tables and start fresh with `complete-schema.sql`
2. Check that extensions are enabled: `uuid-ossp`, `pgcrypto`
3. Ensure you have proper permissions in Supabase

## Next Steps

After running the schema:
1. Set up Supabase Storage buckets for file uploads
2. Configure RLS policies for your authentication system
3. Create Supabase Edge Functions for complex operations
4. Update your frontend to use Supabase client instead of Express API

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify all foreign key references exist
3. Ensure proper data types match your frontend expectations
