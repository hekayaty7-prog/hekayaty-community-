import { MessageCircle, Users, PenTool, Palette, Bookmark, Heart, UserPlus, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';

export function Sidebar() {
  const { threads, bookClubs, workshops, artworks } = useCommunity();
  return (
    <aside className="w-full lg:w-64 bg-card border-r border-border p-3 sm:p-4 lg:p-6 lg:block" data-testid="main-sidebar">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="community-section-title">
            Community
          </h3>
          <nav className="space-y-2" data-testid="community-navigation">
            <Link href="/threads" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-discussions-sidebar">
              <MessageCircle className="w-4 h-4" />
              <span>Discussions</span>
              {threads.length > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full" data-testid="discussions-count">
                  {threads.length}
                </span>
              )}
            </Link>
            <Link href="/workshops" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-workshops-sidebar">
              <PenTool className="w-4 h-4" />
              <span>Writing Workshops</span>
              {workshops.length > 0 && (
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full" data-testid="workshops-count">
                  {workshops.length}
                </span>
              )}
            </Link>
            <Link href="/gallery" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-gallery-sidebar">
              <Palette className="w-4 h-4" />
              <span>Art Gallery</span>
              {artworks.length > 0 && (
                <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full" data-testid="gallery-count">
                  {artworks.length}
                </span>
              )}
            </Link>
          </nav>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="activity-section-title">
            Your Activity
          </h3>
          <nav className="space-y-2" data-testid="activity-navigation">
            <Link href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-bookmarked">
              <Bookmark className="w-4 h-4" />
              <span>Bookmarked</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-liked">
              <Heart className="w-4 h-4" />
              <span>Liked Posts</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-following">
              <UserPlus className="w-4 h-4" />
              <span>Following</span>
            </Link>
          </nav>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="quick-actions-title">
            Quick Actions
          </h3>
          <div className="space-y-2" data-testid="quick-actions">
            <Button asChild className="w-full" data-testid="button-start-discussion">
              <Link href="/threads/new">
                <Plus className="mr-2 h-4 w-4" />
                Start Discussion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
