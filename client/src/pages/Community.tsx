import { useState } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { DiscussionPost } from '@/components/DiscussionPost';
import { BookClubPost } from '@/components/BookClubPost';
import { WorkshopPost } from '@/components/WorkshopPost';
import { ArtGalleryPost } from '@/components/ArtGalleryPost';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommunity } from '@/contexts/CommunityContext';

export function Community() {
  const { posts } = useCommunity();
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const renderPost = (post: any) => {
    switch (post.type) {
      case 'discussion':
        return <DiscussionPost key={post.id} post={post} />;
      case 'book_club':
        return <BookClubPost key={post.id} post={post} />;
      case 'workshop':
        return <WorkshopPost key={post.id} post={post} />;
      case 'art_gallery':
        return <ArtGalleryPost key={post.id} post={post} />;
      default:
        return <DiscussionPost key={post.id} post={post} />;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="community-page">
      <NavigationHeader />
      
      <div className="flex min-h-screen">
        <Sidebar />
        
        <main className="flex-1 p-6" data-testid="main-content">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent p-8 text-white" data-testid="welcome-banner">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2" data-testid="welcome-title">
                  Welcome to StoryVerse Community!
                </h1>
                <p className="text-lg opacity-90 mb-4" data-testid="welcome-description">
                  Connect with fellow storytellers, join creative discussions, and bring your stories to life together.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-white text-primary hover:bg-white/90" data-testid="button-explore-discussions">
                    Explore Discussions
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-join-book-club">
                    Join a Book Club
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Feed Navigation */}
            <div className="flex items-center justify-between" data-testid="activity-navigation">
              <div className="flex space-x-6">
                {['Popular', 'Recent', 'Following', 'Trending'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid={`tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Categories">All Categories</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Discussion Posts Feed */}
            <div className="space-y-6" data-testid="posts-feed">
              {posts.map(renderPost)}
            </div>

            {/* Load More */}
            <div className="text-center py-8" data-testid="load-more-section">
              <Button variant="secondary" size="lg" data-testid="button-load-more">
                Load More Posts
              </Button>
            </div>

          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
