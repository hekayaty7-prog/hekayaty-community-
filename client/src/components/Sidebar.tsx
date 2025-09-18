import { MessageCircle, Users, PenTool, Palette, Bookmark, Heart, UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block" data-testid="main-sidebar">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="community-section-title">
            Community
          </h3>
          <nav className="space-y-2" data-testid="community-navigation">
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-discussions-sidebar">
              <MessageCircle className="w-4 h-4" />
              <span>Discussions</span>
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full" data-testid="discussions-count">42</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-book-clubs-sidebar">
              <Users className="w-4 h-4" />
              <span>Book Clubs</span>
              <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full" data-testid="book-clubs-count">12</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-workshops-sidebar">
              <PenTool className="w-4 h-4" />
              <span>Writing Workshops</span>
              <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full" data-testid="workshops-count">8</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-gallery-sidebar">
              <Palette className="w-4 h-4" />
              <span>Art Gallery</span>
              <span className="ml-auto bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full" data-testid="gallery-count">127</span>
            </a>
          </nav>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="activity-section-title">
            Your Activity
          </h3>
          <nav className="space-y-2" data-testid="activity-navigation">
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-bookmarked">
              <Bookmark className="w-4 h-4" />
              <span>Bookmarked</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-liked">
              <Heart className="w-4 h-4" />
              <span>Liked Posts</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-foreground hover:text-primary hover:bg-secondary/50 px-3 py-2 rounded-md transition-colors" data-testid="nav-following">
              <UserPlus className="w-4 h-4" />
              <span>Following</span>
            </a>
          </nav>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" data-testid="quick-actions-title">
            Quick Actions
          </h3>
          <div className="space-y-2" data-testid="quick-actions">
            <Button className="w-full" data-testid="button-start-discussion">
              <Plus className="mr-2 h-4 w-4" />
              Start Discussion
            </Button>
            <Button variant="secondary" className="w-full" data-testid="button-create-club">
              <Plus className="mr-2 h-4 w-4" />
              Create Club
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
