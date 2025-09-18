import { Search, Bell, ChevronDown, BookOpen } from 'lucide-react';
import { useCommunity } from '@/contexts/CommunityContext';

export function NavigationHeader() {
  const { currentUser } = useCommunity();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border" data-testid="navigation-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-primary text-2xl" data-testid="logo-icon" />
              <span className="text-xl font-bold text-primary" data-testid="brand-name">StoryVerse</span>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="brand-subtitle">Community</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6" data-testid="main-navigation">
              <a href="#" className="text-foreground hover:text-primary transition-colors" data-testid="nav-discussions">
                Discussions
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors" data-testid="nav-book-clubs">
                Book Clubs
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors" data-testid="nav-workshops">
                Workshops
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors" data-testid="nav-gallery">
                Gallery
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search community..." 
                className="pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-64"
                data-testid="search-input"
              />
            </div>
            
            <div className="relative">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="notifications-button">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="notification-count">
                  3
                </span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity" data-testid="user-profile">
              <img 
                src={currentUser?.avatar || ''} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full object-cover"
                data-testid="user-avatar"
              />
              <span className="hidden sm:block text-sm font-medium" data-testid="user-name">
                {currentUser?.displayName}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
