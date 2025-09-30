import { Search, ChevronDown, BookOpen, Menu, X } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';

export function NavigationHeader() {
  const { currentUser } = useCommunity();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border" data-testid="navigation-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <BookOpen className="text-primary text-2xl" data-testid="logo-icon" />
              <span className="text-xl font-bold text-primary" data-testid="brand-name">Hekayaty</span>
            </Link>
            <span className="text-sm text-muted-foreground" data-testid="brand-subtitle">Community</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6" data-testid="main-navigation">
              <Link href="/threads" className="text-foreground hover:text-primary transition-colors" data-testid="nav-discussions">
                Discussions
              </Link>
              <Link href="/workshops" className="text-foreground hover:text-primary transition-colors" data-testid="nav-workshops">
                Workshops
              </Link>
              <Link href="/gallery" className="text-foreground hover:text-primary transition-colors" data-testid="nav-gallery">
                Gallery
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search - Hidden on desktop */}
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search community..." 
                className="pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-48 lg:w-64"
                data-testid="search-input"
              />
            </div>
            
            {/* User Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity touch-manipulation" data-testid="user-profile">
                <img 
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop'} 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                  data-testid="user-avatar"
                />
                <span className="hidden sm:block text-sm font-medium" data-testid="user-name">
                  {currentUser?.display_name || currentUser?.username}
                </span>
                <ChevronDown className="hidden sm:block h-3 w-3 text-muted-foreground" />
              </div>
            ) : (
              <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors touch-manipulation">
                Sign In
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card" data-testid="mobile-menu">
            <nav className="px-4 py-4 space-y-3">
              <Link 
                href="/threads" 
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors touch-manipulation text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Discussions
              </Link>
              <Link 
                href="/workshops" 
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors touch-manipulation text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link 
                href="/gallery" 
                className="block py-3 px-4 text-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors touch-manipulation text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              
              {/* Mobile Search Bar */}
              <div className="pt-3 border-t border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input 
                    type="text" 
                    placeholder="Search community..." 
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-lg"
                    data-testid="mobile-search-input"
                  />
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
