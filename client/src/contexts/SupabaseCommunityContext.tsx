// =====================================================
// SUPABASE COMMUNITY CONTEXT - Real Database Integration
// =====================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  supabase, 
  getDiscussionThreads, 
  getArtworks, 
  getWorkshops, 
  getBookClubs,
  createDiscussionThread,
  uploadArtwork,
  createWorkshop,
  createBookClub
} from '@/lib/supabase';
import { EdgeFunctions } from '@/lib/edge-functions';

// Simplified types for now (we'll expand these)
interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  total_points: number;
  community_level: number;
}

interface Thread {
  id: string;
  title: string;
  content: string | null;
  author_id: string;
  category_id: string | null;
  view_count: number;
  reply_count: number;
  like_count: number;
  created_at: string;
  author?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
    color: string;
    icon: string | null;
  };
}

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  artist_id: string;
  image_url: string;
  tags: string[];
  view_count: number;
  like_count: number;
  created_at: string;
  artist?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
    color: string;
  };
}

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  creator_id: string;
  max_participants: number;
  current_participants: number;
  status: string;
  created_at: string;
  creator?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface BookClub {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  current_member_count: number;
  status: string;
  created_at: string;
  current_book_title?: string | null;
  is_private: boolean;
  creator?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  current_book?: {
    title: string;
    author: string | null;
    cover_image_url: string | null;
  };
}

interface CommunityStats {
  activeMembers: number;
  storiesShared: number;
  artPieces: number;
  bookClubs: number;
}

interface CommunityContextType {
  // Data
  currentUser: User | null;
  threads: Thread[];
  artworks: Artwork[];
  workshops: Workshop[];
  bookClubs: BookClub[];
  communityStats: CommunityStats;
  
  // Loading states
  threadsLoading: boolean;
  artworksLoading: boolean;
  workshopsLoading: boolean;
  bookClubsLoading: boolean;
  
  // Actions
  createThread: (data: { title: string; content: string; category_id?: string; images?: string[] }) => Promise<void>;
  uploadArt: (data: { title: string; description?: string; image_file: File; tags?: string[] }) => Promise<void>;
  createWorkshopAction: (data: { title: string; description?: string; genre?: string; target_words?: number; max_participants?: number; timeline?: string }) => Promise<any>;
  createBookClubAction: (data: { name: string; description?: string; current_book_title?: string; is_private?: boolean }) => Promise<any>;
  likeThread: (threadId: string) => void;
  likeArtwork: (artworkId: string) => void;
  
  // Auth
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}

interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // =====================================================
  // SIMPLE AUTH MANAGEMENT
  // =====================================================
  
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...');
      
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Found existing session');
        await loadUserProfile(session.user.id);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state changed:', event);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setCurrentUser(null);
          }
        }
      );

      setIsInitialized(true);
      console.log('✅ Auth initialized successfully');

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setIsInitialized(true); // Still set to true to prevent infinite loading
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to get existing profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        console.log('✅ Found user profile');
        setCurrentUser({
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          is_verified: false,
          total_points: 0,
          community_level: 1,
        });
      } else {
        // Create profile for new user
        console.log('🆕 Creating new user profile');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  };

  // Create user profile for new users
  const createUserProfile = async (userId: string) => {
    try {
      // Get user info from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Create user profile
      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${userId.slice(0, 8)}`,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Community Member',
          avatar_url: user.user_metadata?.avatar_url || null,
          bio: 'Welcome to StoryVerse Community! 🌟',
        }])
        .select()
        .single();

      if (error) throw error;

      if (newProfile) {
        console.log('✅ Created user profile');
        setCurrentUser({
          id: newProfile.id,
          username: newProfile.username,
          display_name: newProfile.display_name,
          avatar_url: newProfile.avatar_url,
          bio: newProfile.bio,
          is_verified: false,
          total_points: 0,
          community_level: 1,
        });
      }
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
    }
  };

  // =====================================================
  // DATA QUERIES
  // =====================================================

  // Fetch discussion threads
  const { 
    data: threads = [], 
    isLoading: threadsLoading,
    refetch: refetchThreads 
  } = useQuery({
    queryKey: ['discussion-threads-v3'],
    queryFn: async () => {
      try {
        return await getDiscussionThreads(20, 0);
      } catch (error) {
        console.log('📝 No discussion threads yet - that\'s okay!');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch artworks
  const { 
    data: artworks = [], 
    isLoading: artworksLoading,
    refetch: refetchArtworks 
  } = useQuery({
    queryKey: ['artworks-v3'],
    queryFn: async () => {
      try {
        return await getArtworks(20, 0);
      } catch (error) {
        console.log('🎨 No artworks yet - that\'s okay!');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch workshops
  const { 
    data: workshops = [], 
    isLoading: workshopsLoading,
    refetch: refetchWorkshops 
  } = useQuery({
    queryKey: ['workshops-v3'],
    queryFn: async () => {
      try {
        return await getWorkshops(20, 0);
      } catch (error) {
        console.log('✍️ No workshops yet - that\'s okay!');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch book clubs
  const { 
    data: bookClubs = [], 
    isLoading: bookClubsLoading,
    refetch: refetchBookClubs 
  } = useQuery({
    queryKey: ['book-clubs-v3'],
    queryFn: async () => {
      try {
        return await getBookClubs(20, 0);
      } catch (error) {
        console.log('📚 No book clubs yet - that\'s okay!');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Community stats (calculated from real data)
  const communityStats: CommunityStats = {
    activeMembers: 0, // We'll calculate this from profiles
    storiesShared: threads.length,
    artPieces: artworks.length,
    bookClubs: bookClubs.length,
  };

  // =====================================================
  // MUTATIONS
  // =====================================================

  const createThreadMutation = useMutation({
    mutationFn: createDiscussionThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-threads-v3'] });
    },
  });

  const uploadArtworkMutation = useMutation({
    mutationFn: uploadArtwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });

  const createWorkshopMutation = useMutation({
    mutationFn: createWorkshop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops-v3'] });
      queryClient.invalidateQueries({ queryKey: ['workshop'] }); // For individual workshop queries
    },
  });

  const createBookClubMutation = useMutation({
    mutationFn: createBookClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-clubs'] });
    },
  });

  // =====================================================
  // ACTION HANDLERS
  // =====================================================

  const createThread = async (data: { title: string; content: string; category_id?: string; images?: string[] }) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create thread');
    }

    // Get the actual auth user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    await createThreadMutation.mutateAsync({
      ...data,
      author_id: user.id, // Use auth user ID
    });
  };

  const uploadArt = async (data: { title: string; description?: string; image_file: File; tags?: string[] }) => {
    if (!currentUser) {
      throw new Error('Must be logged in to upload artwork');
    }

    // Get the actual auth user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    await uploadArtworkMutation.mutateAsync({
      ...data,
      artist_id: user.id, // Use auth user ID
    });
  };

  const createWorkshopAction = async (data: { title: string; description?: string; genre?: string; target_words?: number; max_participants?: number; timeline?: string }) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create workshop');
    }

    // Get the actual auth user ID (not the profile ID)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const result = await createWorkshopMutation.mutateAsync({
      ...data,
      creator_id: user.id, // Use auth user ID, not profile ID
    });
    
    return result;
  };

  const createBookClubAction = async (data: { name: string; description?: string; current_book_title?: string; is_private?: boolean }) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create book club');
    }

    // Get the actual auth user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const result = await createBookClubMutation.mutateAsync({
      ...data,
      creator_id: user.id, // Use auth user ID
    });
    
    return result;
  };

  const likeThread = async (threadId: string) => {
    // TODO: Implement thread liking
    console.log('Like thread:', threadId);
  };

  const likeArtwork = async (artworkId: string) => {
    // TODO: Implement artwork liking
    console.log('Like artwork:', artworkId);
  };

  // Auth actions
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Create profile after signup
    // Note: This should be handled by a database trigger in production
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value: CommunityContextType = {
    // Data
    currentUser,
    threads,
    artworks,
    workshops,
    bookClubs,
    communityStats,
    
    // Loading states
    threadsLoading,
    artworksLoading,
    workshopsLoading,
    bookClubsLoading,
    
    // Actions
    createThread,
    uploadArt,
    createWorkshopAction,
    createBookClubAction,
    likeThread,
    likeArtwork,
    
    // Auth
    signIn,
    signUp,
    signOut,
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing StoryVerse Community...</p>
        </div>
      </div>
    );
  }

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
