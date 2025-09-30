// =====================================================
// SSO UTILITIES - For HEKAYATY Main Website Integration
// =====================================================

import { supabase } from '../lib/supabase';

// Configuration for your main HEKAYATY website
const MAIN_WEBSITE_URL = 'https://hekayaty.com';
const COMMUNITY_URL = process.env.NODE_ENV === 'production' 
  ? 'https://community.hekayaty.com' // Your Vercel domain
  : 'http://localhost:5000';

/**
 * Generate SSO link for redirecting users from main website to community
 * Call this from your main website when user wants to access community
 */
export const generateSSOLink = async (
  communityUrl: string = 'http://localhost:5000',
  redirectPath: string = '/'
): Promise<string | null> => {
  try {
    // Get current session from main website
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('🔐 SSO: No active session found');
      return null;
    }

    // Create SSO link with auth token
    const ssoUrl = new URL(communityUrl + redirectPath);
    ssoUrl.searchParams.set('auth_token', session.access_token);
    
    console.log('🔐 SSO: Generated community link with auth token');
    return ssoUrl.toString();
  } catch (error) {
    console.error('🔐 SSO: Error generating SSO link:', error);
    return null;
  }
};

/**
 * Check if user has community access
 * Call this to determine if user should see community navigation
 */
export const hasCommunitAccess = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('🔐 SSO: Error checking community access:', error);
    return false;
  }
};

/**
 * Get current user info for SSO
 * Useful for displaying user info before redirecting to community
 */
export const getCurrentSSOUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('🔐 SSO: Error getting current user:', error);
    return null;
  }
};

/**
 * Sign out from both main website and community
 * Call this from main website logout to ensure complete sign out
 */
export const signOutEverywhere = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    console.log('🔐 SSO: Signed out from all platforms');
  } catch (error) {
    console.error('🔐 SSO: Error during sign out:', error);
  }
};

// =====================================================
// MAIN WEBSITE INTEGRATION EXAMPLES
// =====================================================

/*
// Example 1: Add community link to main website navigation
const CommunityNavLink = () => {
  const [ssoLink, setSsoLink] = useState<string | null>(null);

  useEffect(() => {
    generateSSOLink('https://community.yoursite.com').then(setSsoLink);
  }, []);

  if (!ssoLink) return null;

  return (
    <a href={ssoLink} className="nav-link">
      Join Community 🚀
    </a>
  );
};

// Example 2: Community access button
const CommunityAccessButton = () => {
  const handleCommunityAccess = async () => {
    const link = await generateSSOLink('https://community.yoursite.com', '/gallery');
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <button onClick={handleCommunityAccess}>
      View Art Gallery 🎨
    </button>
  );
};

// Example 3: Check access before showing community features
const ConditionalCommunityFeatures = () => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    hasCommunitAccess().then(setHasAccess);
  }, []);

  if (!hasAccess) return null;

  return (
    <div className="community-features">
      <h3>Community Features Available!</h3>
      // ... community-related UI
    </div>
  );
};
*/
