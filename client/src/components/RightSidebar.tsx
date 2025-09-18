import { Button } from '@/components/ui/button';
import { useCommunity } from '@/contexts/CommunityContext';

export function RightSidebar() {
  const { communityStats, trendingTopics, bookClubs, suggestedUsers, followUser, followedUsers } = useCommunity();

  return (
    <aside className="w-80 bg-card border-l border-border p-6 hidden xl:block" data-testid="right-sidebar">
      <div className="space-y-6">
        
        {/* Community Stats */}
        <div className="bg-secondary/30 rounded-lg p-4" data-testid="community-stats">
          <h3 className="font-semibold text-foreground mb-3" data-testid="stats-title">Community Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between" data-testid="stat-active-members">
              <span className="text-muted-foreground">Active Members</span>
              <span className="font-medium">{communityStats.activeMembers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" data-testid="stat-stories-shared">
              <span className="text-muted-foreground">Stories Shared</span>
              <span className="font-medium">{communityStats.storiesShared.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" data-testid="stat-art-pieces">
              <span className="text-muted-foreground">Art Pieces</span>
              <span className="font-medium">{communityStats.artPieces.toLocaleString()}</span>
            </div>
            <div className="flex justify-between" data-testid="stat-book-clubs">
              <span className="text-muted-foreground">Book Clubs</span>
              <span className="font-medium">{communityStats.bookClubs}</span>
            </div>
          </div>
        </div>

        {/* Trending Topics */}
        <div data-testid="trending-topics">
          <h3 className="font-semibold text-foreground mb-3" data-testid="trending-title">Trending Topics</h3>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between" data-testid={`trending-topic-${index}`}>
                <span className="text-primary hover:text-primary/80 cursor-pointer">{topic.tag}</span>
                {topic.isHot ? (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full" data-testid="hot-badge">Hot</span>
                ) : (
                  <span className="text-xs text-muted-foreground" data-testid={`topic-count-${index}`}>{topic.count} posts</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Book Clubs */}
        <div data-testid="active-book-clubs">
          <h3 className="font-semibold text-foreground mb-3" data-testid="book-clubs-title">Active Book Clubs</h3>
          <div className="space-y-3">
            {bookClubs.map((club) => (
              <div key={club.id} className="bg-secondary/50 p-3 rounded-lg" data-testid={`book-club-${club.id}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm" data-testid={`club-name-${club.id}`}>{club.name}</span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded" data-testid={`club-members-${club.id}`}>
                    {club.memberCount} members
                  </span>
                </div>
                <p className="text-xs text-muted-foreground" data-testid={`club-current-book-${club.id}`}>
                  Currently reading "{club.currentBook}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Connections */}
        <div data-testid="suggested-connections">
          <h3 className="font-semibold text-foreground mb-3" data-testid="suggestions-title">Suggested Connections</h3>
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3" data-testid={`suggested-user-${user.id}`}>
                <img 
                  src={user.avatar || ''} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid={`user-avatar-${user.id}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm" data-testid={`user-name-${user.id}`}>{user.displayName}</div>
                  <div className="text-xs text-muted-foreground" data-testid={`user-bio-${user.id}`}>{user.bio}</div>
                </div>
                <Button
                  size="sm"
                  variant={followedUsers?.has(user.id) ? "secondary" : "default"}
                  onClick={() => followUser(user.id)}
                  data-testid={`follow-button-${user.id}`}
                  className="text-xs px-3 py-1"
                >
                  {followedUsers?.has(user.id) ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div data-testid="quick-links">
          <h3 className="font-semibold text-foreground mb-3" data-testid="quick-links-title">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-guidelines">
              Community Guidelines
            </a>
            <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-resources">
              Writing Resources
            </a>
            <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-commissions">
              Art Commission Board
            </a>
            <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-events">
              Events Calendar
            </a>
            <a href="#" className="block text-muted-foreground hover:text-primary transition-colors" data-testid="link-support">
              Help & Support
            </a>
          </div>
        </div>

      </div>
    </aside>
  );
}
