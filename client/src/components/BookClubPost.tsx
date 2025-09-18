import { Users, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostCard } from './PostCard';
import { Post } from '@shared/schema';
import { useCommunity } from '@/contexts/CommunityContext';
import { useState } from 'react';

interface BookClubPostProps {
  post: Post;
}

export function BookClubPost({ post }: BookClubPostProps) {
  const { joinBookClub, likePost } = useCommunity();
  const metadata = post.metadata as any;
  const [localLikes, setLocalLikes] = useState(post.likes);
  
  const handleLike = () => {
    likePost(post.id);
    setLocalLikes(prev => prev + 1);
  };

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-colors" data-testid={`book-club-post-${post.id}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={metadata?.author?.avatar} 
          alt="User Avatar" 
          className="w-12 h-12 rounded-full object-cover"
          data-testid={`book-club-author-avatar-${post.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`book-club-author-name-${post.id}`}>
              {metadata?.author?.name}
            </h3>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded" data-testid={`book-club-author-role-${post.id}`}>
              {metadata?.author?.role}
            </span>
            <span className="text-sm text-muted-foreground">in</span>
            <span className="text-sm text-primary font-medium" data-testid={`book-club-category-${post.id}`}>
              #{post.category}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`book-club-time-${post.id}`}>
              • {metadata?.timeAgo}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors" data-testid={`book-club-title-${post.id}`}>
            {post.title}
          </h2>
          
          <div className="bg-secondary/50 border-l-4 border-accent p-4 mb-4 rounded" data-testid={`book-club-progress-${post.id}`}>
            <p className="text-sm text-muted-foreground mb-2">Current Reading Progress</p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-accent rounded-full h-2" 
                  style={{ width: `${metadata?.progress || 0}%` }}
                  data-testid={`book-club-progress-bar-${post.id}`}
                ></div>
              </div>
              <span className="text-sm font-medium" data-testid={`book-club-progress-percent-${post.id}`}>
                {metadata?.progress || 0}%
              </span>
            </div>
            <p className="text-sm" data-testid={`book-club-deadline-${post.id}`}>
              Chapters 10-15 • Due: {metadata?.deadline}
            </p>
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`book-club-content-${post.id}`}>
            {post.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-2 text-muted-foreground hover:text-destructive transition-colors" 
                data-testid={`book-club-like-${post.id}`}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">{localLikes}</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`book-club-comment-${post.id}`}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.replies} replies</span>
              </button>
              <span className="flex items-center space-x-2 text-muted-foreground" data-testid={`book-club-members-${post.id}`}>
                <Users className="h-4 w-4" />
                <span className="text-sm">{metadata?.memberCount} members</span>
              </span>
            </div>
            <Button 
              onClick={() => joinBookClub(post.id)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid={`book-club-join-${post.id}`}
            >
              Join Discussion
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
