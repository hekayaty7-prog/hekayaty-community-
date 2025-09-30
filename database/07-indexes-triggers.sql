-- =====================================================
-- INDEXES, TRIGGERS & FUNCTIONS
-- =====================================================

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- User profiles indexes
CREATE INDEX idx_storyweave_profiles_hekayaty_user_id ON public.storyweave_profiles(hekayaty_user_id);
CREATE INDEX idx_storyweave_profiles_username ON public.storyweave_profiles(username);
CREATE INDEX idx_storyweave_profiles_active ON public.storyweave_profiles(is_active, last_active_at DESC);
CREATE INDEX idx_storyweave_profiles_created_at ON public.storyweave_profiles(created_at DESC);

-- Discussion threads indexes
CREATE INDEX idx_discussion_threads_author_id ON public.discussion_threads(author_id);
CREATE INDEX idx_discussion_threads_category_id ON public.discussion_threads(category_id);
CREATE INDEX idx_discussion_threads_created_at ON public.discussion_threads(created_at DESC);
CREATE INDEX idx_discussion_threads_last_activity ON public.discussion_threads(last_activity_at DESC);
CREATE INDEX idx_discussion_threads_pinned_activity ON public.discussion_threads(is_pinned DESC, last_activity_at DESC);
CREATE INDEX idx_discussion_threads_featured ON public.discussion_threads(is_featured DESC, created_at DESC);
CREATE INDEX idx_discussion_threads_tags ON public.discussion_threads USING GIN(tags);

-- Thread replies indexes
CREATE INDEX idx_thread_replies_thread_id ON public.thread_replies(thread_id);
CREATE INDEX idx_thread_replies_author_id ON public.thread_replies(author_id);
CREATE INDEX idx_thread_replies_parent_id ON public.thread_replies(parent_reply_id);
CREATE INDEX idx_thread_replies_created_at ON public.thread_replies(created_at);
CREATE INDEX idx_thread_replies_path ON public.thread_replies(reply_path);

-- Workshops indexes
CREATE INDEX idx_workshops_creator_id ON public.workshops(creator_id);
CREATE INDEX idx_workshops_category_id ON public.workshops(category_id);
CREATE INDEX idx_workshops_status ON public.workshops(status);
CREATE INDEX idx_workshops_genre ON public.workshops(genre);
CREATE INDEX idx_workshops_created_at ON public.workshops(created_at DESC);
CREATE INDEX idx_workshops_starts_at ON public.workshops(starts_at);

-- Workshop members indexes
CREATE INDEX idx_workshop_members_workshop_id ON public.workshop_members(workshop_id);
CREATE INDEX idx_workshop_members_user_id ON public.workshop_members(user_id);
CREATE INDEX idx_workshop_members_role ON public.workshop_members(role);
CREATE INDEX idx_workshop_members_status ON public.workshop_members(status);

-- Book clubs indexes
CREATE INDEX idx_book_clubs_creator_id ON public.book_clubs(creator_id);
CREATE INDEX idx_book_clubs_current_book_id ON public.book_clubs(current_book_id);
CREATE INDEX idx_book_clubs_status ON public.book_clubs(status);
CREATE INDEX idx_book_clubs_created_at ON public.book_clubs(created_at DESC);
CREATE INDEX idx_book_clubs_genres ON public.book_clubs USING GIN(preferred_genres);

-- Book club members indexes
CREATE INDEX idx_book_club_members_club_id ON public.book_club_members(club_id);
CREATE INDEX idx_book_club_members_user_id ON public.book_club_members(user_id);
CREATE INDEX idx_book_club_members_role ON public.book_club_members(role);

-- Books indexes
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_books_genres ON public.books USING GIN(genres);
CREATE INDEX idx_books_isbn_13 ON public.books(isbn_13);
CREATE INDEX idx_books_published_date ON public.books(published_date);

-- Artworks indexes
CREATE INDEX idx_artworks_artist_id ON public.artworks(artist_id);
CREATE INDEX idx_artworks_category_id ON public.artworks(category_id);
CREATE INDEX idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX idx_artworks_featured ON public.artworks(is_featured DESC, created_at DESC);
CREATE INDEX idx_artworks_status ON public.artworks(status);
CREATE INDEX idx_artworks_tags ON public.artworks USING GIN(tags);
CREATE INDEX idx_artworks_style_tags ON public.artworks USING GIN(style_tags);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Messages indexes
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_conversation_id ON public.direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Activity feed indexes
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public, created_at DESC);
CREATE INDEX idx_activity_feed_type ON public.activity_feed(activity_type);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate username from HEKAYATY user data
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
    final_username TEXT;
    counter INTEGER := 0;
BEGIN
    final_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM public.storyweave_profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '_' || counter;
    END LOOP;
    
    RETURN final_username;
END;
$$ language 'plpgsql';

-- Function to calculate reading progress percentage
CREATE OR REPLACE FUNCTION calculate_reading_progress(current_page INTEGER, total_pages INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF total_pages IS NULL OR total_pages = 0 THEN
        RETURN 0.00;
    END IF;
    
    RETURN ROUND((current_page::DECIMAL / total_pages::DECIMAL) * 100, 2);
END;
$$ language 'plpgsql';

-- Function to update thread activity timestamp
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.discussion_threads 
    SET last_activity_at = NOW(),
        reply_count = reply_count + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END
    WHERE id = COALESCE(NEW.thread_id, OLD.thread_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to update like counts
CREATE OR REPLACE FUNCTION update_content_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment like count
        IF NEW.thread_id IS NOT NULL THEN
            UPDATE public.discussion_threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
        ELSIF NEW.reply_id IS NOT NULL THEN
            UPDATE public.thread_replies SET like_count = like_count + 1 WHERE id = NEW.reply_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement like count
        IF OLD.thread_id IS NOT NULL THEN
            UPDATE public.discussion_threads SET like_count = like_count - 1 WHERE id = OLD.thread_id;
        ELSIF OLD.reply_id IS NOT NULL THEN
            UPDATE public.thread_replies SET like_count = like_count - 1 WHERE id = OLD.reply_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';
