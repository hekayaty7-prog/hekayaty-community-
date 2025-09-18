import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunity } from '@/contexts/CommunityContext';
import { Post } from '@shared/schema';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { likePost, bookmarkPost } = useCommunity();
  const author = (post.metadata as any)?.author;

  const handleLike = () => {
    likePost(post.id);
  };

  const handleBookmark = () => {
    bookmarkPost(post.id);
  };

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-colors" data-testid={`post-${post.id}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={author?.avatar} 
          alt="User Avatar" 
          className="w-12 h-12 rounded-full object-cover"
          data-testid={`post-author-avatar-${post.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`post-author-name-${post.id}`}>
              {author?.name}
            </h3>
            {author?.role && author.role !== 'member' && (
              <Badge variant="secondary" className="text-xs" data-testid={`post-author-role-${post.id}`}>
                {author.role}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">in</span>
            <span className="text-sm text-primary font-medium" data-testid={`post-category-${post.id}`}>
              #{post.category}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`post-time-${post.id}`}>
              • {(post.metadata as any)?.timeAgo}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors" data-testid={`post-title-${post.id}`}>
            {post.title}
          </h2>
          
          <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`post-content-${post.id}`}>
            {post.content}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" data-testid={`post-tags-${post.id}`}>
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm" data-testid={`post-tag-${post.id}-${index}`}>
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-2 text-muted-foreground hover:text-destructive transition-colors"
                data-testid={`button-like-${post.id}`}
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm" data-testid={`like-count-${post.id}`}>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`button-comment-${post.id}`}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm" data-testid={`reply-count-${post.id}`}>{post.replies} replies</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors" data-testid={`button-share-${post.id}`}>
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>
              <button 
                onClick={handleBookmark}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`button-bookmark-${post.id}`}
              >
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm" data-testid={`button-read-more-${post.id}`}>
              Read More →
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
