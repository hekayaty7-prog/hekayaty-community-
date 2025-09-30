// =====================================================
// SUPABASE DATABASE TYPES
// =====================================================
// Auto-generated types for TypeScript integration

export interface Database {
  public: {
    Tables: {
      storyweave_profiles: {
        Row: {
          id: string
          hekayaty_user_id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website_url: string | null
          social_links: Record<string, any>
          writing_genres: string[]
          favorite_authors: string[]
          writing_experience: string
          writing_goals: string | null
          reading_genres: string[]
          reading_goal_yearly: number
          current_reading_streak: number
          total_points: number
          community_level: number
          reputation_score: number
          profile_visibility: string
          show_reading_activity: boolean
          show_writing_progress: boolean
          is_verified: boolean
          is_premium: boolean
          is_active: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hekayaty_user_id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website_url?: string | null
          social_links?: Record<string, any>
          writing_genres?: string[]
          favorite_authors?: string[]
          writing_experience?: string
          writing_goals?: string | null
          reading_genres?: string[]
          reading_goal_yearly?: number
          current_reading_streak?: number
          total_points?: number
          community_level?: number
          reputation_score?: number
          profile_visibility?: string
          show_reading_activity?: boolean
          show_writing_progress?: boolean
          is_verified?: boolean
          is_premium?: boolean
          is_active?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hekayaty_user_id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website_url?: string | null
          social_links?: Record<string, any>
          writing_genres?: string[]
          favorite_authors?: string[]
          writing_experience?: string
          writing_goals?: string | null
          reading_genres?: string[]
          reading_goal_yearly?: number
          current_reading_streak?: number
          total_points?: number
          community_level?: number
          reputation_score?: number
          profile_visibility?: string
          show_reading_activity?: boolean
          show_writing_progress?: boolean
          is_verified?: boolean
          is_premium?: boolean
          is_active?: boolean
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          title: string
          description: string | null
          artist_id: string
          category_id: string | null
          image_url: string
          thumbnail_url: string | null
          tags: string[]
          content_rating: string
          view_count: number
          like_count: number
          comment_count: number
          is_featured: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          artist_id: string
          category_id?: string | null
          image_url: string
          thumbnail_url?: string | null
          tags?: string[]
          content_rating?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          artist_id?: string
          category_id?: string | null
          image_url?: string
          thumbnail_url?: string | null
          tags?: string[]
          content_rating?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      discussion_threads: {
        Row: {
          id: string
          title: string
          content: string | null
          author_id: string
          category_id: string | null
          thread_type: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          reply_count: number
          like_count: number
          last_activity_at: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          author_id: string
          category_id?: string | null
          thread_type?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          like_count?: number
          last_activity_at?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          author_id?: string
          category_id?: string | null
          thread_type?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          reply_count?: number
          like_count?: number
          last_activity_at?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          category_id: string | null
          genre: string | null
          max_participants: number
          current_participants: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          category_id?: string | null
          genre?: string | null
          max_participants?: number
          current_participants?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          category_id?: string | null
          genre?: string | null
          max_participants?: number
          current_participants?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      book_clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string
          current_book_id: string | null
          is_private: boolean
          max_members: number
          current_member_count: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          creator_id: string
          current_book_id?: string | null
          is_private?: boolean
          max_members?: number
          current_member_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          creator_id?: string
          current_book_id?: string | null
          is_private?: boolean
          max_members?: number
          current_member_count?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      art_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
        }
      }
      discussion_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string
          is_active?: boolean
          created_at?: string
        }
      }
      workshop_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string | null
          isbn_13: string | null
          cover_image_url: string | null
          description: string | null
          genres: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author?: string | null
          isbn_13?: string | null
          cover_image_url?: string | null
          description?: string | null
          genres?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string | null
          isbn_13?: string | null
          cover_image_url?: string | null
          description?: string | null
          genres?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
