import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Post, BookClub, Workshop } from '@shared/schema';

interface CommunityContextType {
  currentUser: User | null;
  posts: Post[];
  bookClubs: BookClub[];
  workshops: Workshop[];
  communityStats: {
    activeMembers: number;
    storiesShared: number;
    artPieces: number;
    bookClubs: number;
  };
  trendingTopics: { tag: string; count: number; isHot?: boolean }[];
  suggestedUsers: User[];
  followedUsers: Set<string>;
  likePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  followUser: (userId: string) => void;
  joinBookClub: (clubId: string) => void;
  createBookClub: (club: Omit<BookClub, 'id' | 'createdAt' | 'memberCount' | 'progress'>) => BookClub;
  joinWorkshop: (workshopId: string) => void;
  createWorkshop: (
    workshop: Omit<Workshop, 'id' | 'createdAt' | 'currentWriters'> & { currentWriters?: number },
  ) => Workshop;
  joinedClubs: Set<string>;
  joinedWorkshops: Set<string>;
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
  // Mock current user
  const [currentUser] = useState<User>({
    id: 'current-user',
    username: 'sarah_chen',
    displayName: 'Sarah Chen',
    avatar: 'https://pixabay.com/get/g39e1bbe879bdb025cd38dc6dbf7b3bd35707f16370c2618ceb7a6439ce7d83942e69fa0bc9100811c97593dac8c39c26f08ecad8e5acf97c9c96120f78993731_1280.jpg',
    bio: 'Passionate storyteller and community enthusiast',
    role: 'member',
    badges: [],
    createdAt: new Date(),
  });

  // Mock posts data
  const [posts] = useState<Post[]>([
    {
      id: 'post-1',
      userId: 'user-1',
      type: 'discussion',
      title: '🔥 The Ultimate Guide to Character Development: 7 Techniques That Will Transform Your Stories',
      content: 'After years of writing and helping other authors, I\'ve compiled the most effective character development techniques that have consistently helped create memorable, three-dimensional characters. Let\'s dive into what really makes readers connect...',
      category: 'writing-tips',
      tags: ['character-development', 'writing-tips', 'storytelling'],
      likes: 127,
      replies: 43,
      images: [],
      metadata: {
        author: {
          name: 'Emma Rodriguez',
          avatar: 'https://pixabay.com/get/g3dffcddcc81988d43bb4bcba799ad29fbf86c8a618e699fd4cdcdace1c518dd920a452f32cac3cd4aebad99c12c23e29b27e102f5a8a673c62e7ae5b08413ccd_1280.jpg',
          role: 'Moderator'
        },
        timeAgo: '2 hours ago'
      },
      createdAt: new Date(),
    },
    {
      id: 'post-2',
      userId: 'user-2',
      type: 'book_club',
      title: '📚 "Dune" Book Club Discussion - Week 3: The Politics of Arrakis',
      content: 'What are your thoughts on Herbert\'s portrayal of political intrigue? I\'m fascinated by how the spice trade mirrors real-world resource conflicts. Let\'s discuss the parallels and your favorite political moments so far...',
      category: 'sci-fi-explorers',
      tags: ['dune', 'book-club', 'politics'],
      likes: 89,
      replies: 32,
      images: [],
      metadata: {
        author: {
          name: 'David Park',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
          role: 'Club Leader'
        },
        timeAgo: '4 hours ago',
        progress: 60,
        memberCount: 24,
        deadline: 'Friday, Nov 15'
      },
      createdAt: new Date(),
    },
    {
      id: 'post-3',
      userId: 'user-3',
      type: 'workshop',
      title: '✍️ Looking for Co-Writers: Urban Fantasy Series "The Midnight Market"',
      content: 'I\'m starting a collaborative urban fantasy project about a hidden magical marketplace that appears only at midnight in different cities worldwide. Looking for 3 more writers to help develop characters and storylines. Each writer would take ownership of specific characters while contributing to the overarching plot...',
      category: 'collaborative-writing',
      tags: ['urban-fantasy', 'collaboration', 'seeking-writers'],
      likes: 56,
      replies: 18,
      images: [],
      metadata: {
        author: {
          name: 'Maya Singh',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
          role: 'member'
        },
        timeAgo: '6 hours ago',
        currentWriters: 2,
        maxWriters: 5,
        genre: 'Urban Fantasy',
        targetWords: '80k words',
        timeline: '6 months'
      },
      createdAt: new Date(),
    },
    {
      id: 'post-4',
      userId: 'user-4',
      type: 'art_gallery',
      title: '🎨 Character Portrait Series: "The Last Starfinder" by @sarah_writes',
      content: 'Just finished this commission for Sarah\'s amazing space opera! These are the three main characters from "The Last Starfinder" - Captain Zara, Mystic Kai, and Scout Lix. I love how each character\'s personality shines through in their designs. Sarah gave me such detailed descriptions to work with!',
      category: 'character-art',
      tags: ['character-design', 'commission', 'sci-fi'],
      likes: 234,
      replies: 67,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400',
        'https://pixabay.com/get/g3fa0ea9ec7a2b91d3c99fa01d96923f47ec3480b8a7e0312e308600e8eccd10f1ecb7b633ba0516bd1a761adacdcf7fa655d6c76bc233db24aec59ac80c8a431_1280.jpg',
        'https://images.unsplash.com/photo-1527082395-e939b847da0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
      ],
      metadata: {
        author: {
          name: 'Alex Turner',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
          role: 'Artist'
        },
        timeAgo: '8 hours ago',
        commission: true
      },
      createdAt: new Date(),
    }
  ]);

  const [bookClubs, setBookClubs] = useState<BookClub[]>([
    {
      id: 'club-1',
      name: 'Sci-Fi Explorers',
      description: 'Exploring the vast universe of science fiction',
      currentBook: 'Dune',
      progress: 60,
      memberCount: 24,
      isPrivate: false,
      createdAt: new Date(),
    },
    {
      id: 'club-2',
      name: 'Romance Readers',
      description: 'All about love stories and romantic narratives',
      currentBook: 'Red, White & Royal Blue',
      progress: 45,
      memberCount: 31,
      isPrivate: false,
      createdAt: new Date(),
    },
    {
      id: 'club-3',
      name: 'Fantasy Guild',
      description: 'Dive into magical worlds and epic adventures',
      currentBook: 'The Name of the Wind',
      progress: 30,
      memberCount: 18,
      isPrivate: false,
      createdAt: new Date(),
    }
  ]);

  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  // membership sets
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [joinedWorkshops, setJoinedWorkshops] = useState<Set<string>>(new Set());

  const [communityStats] = useState({
    activeMembers: 12847,
    storiesShared: 3456,
    artPieces: 1923,
    bookClubs: 127,
  });

  const [trendingTopics] = useState([
    { tag: '#character-development', count: 156, isHot: true },
    { tag: '#world-building', count: 156 },
    { tag: '#romance-writing', count: 89 },
    { tag: '#fantasy-art', count: 67 },
    { tag: '#writing-prompts', count: 45 },
  ]);

  const [suggestedUsers] = useState<User[]>([
    {
      id: 'suggested-1',
      username: 'jennifer_walsh',
      displayName: 'Jennifer Walsh',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
      bio: 'Fantasy Author',
      role: 'member',
      badges: [],
      createdAt: new Date(),
    },
    {
      id: 'suggested-2',
      username: 'marcus_chen',
      displayName: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
      bio: 'Character Artist',
      role: 'member',
      badges: [],
      createdAt: new Date(),
    },
    {
      id: 'suggested-3',
      username: 'lisa_park',
      displayName: 'Lisa Park',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100',
      bio: 'Romance Writer',
      role: 'member',
      badges: [],
      createdAt: new Date(),
    }
  ]);

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const likePost = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const bookmarkPost = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const followUser = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const joinBookClub = (clubId: string) => {
    setJoinedClubs(prev => new Set(prev).add(clubId));
  };

  const createBookClub = (club: Omit<BookClub, 'id' | 'createdAt' | 'memberCount' | 'progress'>) => {
    const id = `club-${Date.now()}`;
    const newClub: BookClub = {
      ...club,
      id,
      memberCount: 1,
      progress: 0,
      createdAt: new Date(),
    };
    setBookClubs(prev => [...prev, newClub]);
    setJoinedClubs(prev => new Set(prev).add(id));
    return newClub;
  };

  const joinWorkshop = (workshopId: string) => {
    setJoinedWorkshops(prev => new Set(prev).add(workshopId));
  };

  const createWorkshop = (
    workshop: Omit<Workshop, 'id' | 'createdAt' | 'currentWriters'> & { currentWriters?: number },
  ) => {
    const id = `workshop-${Date.now()}`;
    const newWorkshop: Workshop = {
      ...workshop,
      id,
      currentWriters: 1,
      createdAt: new Date(),
    };
    setWorkshops(prev => [...prev, newWorkshop]);
    setJoinedWorkshops(prev => new Set(prev).add(id));
    return newWorkshop;
  };

  const value: CommunityContextType = {
    currentUser,
    posts,
    bookClubs,
    workshops,
    communityStats,
    trendingTopics,
    suggestedUsers,
    followedUsers,
    likePost,
    bookmarkPost,
    followUser,
    joinBookClub,
    joinWorkshop,
    createBookClub,
    createWorkshop,
    joinedClubs,
    joinedWorkshops,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}
