import { NavigationHeader } from './NavigationHeader';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { useLocation } from 'wouter';
import backgroundImage from '@/assets/c79d8e3c-1594-4711-97bf-606619c10341.png';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  
  // Add error boundary for useCommunity hook
  let currentUser = null;
  try {
    const communityContext = useCommunity();
    currentUser = communityContext.currentUser;
  } catch (error) {
    console.error('Layout: useCommunity hook failed:', error);
    // Fallback behavior when context is not available
    currentUser = null;
  }
  
  // Pages that shouldn't show the navigation header
  const noHeaderPages = ['/login', '/signup'];
  const shouldShowHeader = !noHeaderPages.includes(location);
  
  // Pages that shouldn't have the background image
  const noBackgroundPages = ['/gallery', '/login', '/signup'];
  const shouldShowBackground = !noBackgroundPages.includes(location) && !location.startsWith('/gallery');

  // Show login prompt for protected pages when user is not authenticated
  if (!currentUser && !noHeaderPages.includes(location)) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center bg-[#4b2e2e]/90 backdrop-blur-sm p-8 rounded-xl shadow-xl text-white">
          <h2 className="text-2xl font-bold text-primary mb-4">Welcome to Hekayaty</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access the community</p>
          <a 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={shouldShowBackground ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : { backgroundColor: 'hsl(30, 85%, 5%)' }}
    >
      {shouldShowHeader && <NavigationHeader />}
      <main>
        {children}
      </main>
    </div>
  );
}
