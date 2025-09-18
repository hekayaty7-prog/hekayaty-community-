import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post } from '@shared/schema';
import { useCommunity } from '@/contexts/CommunityContext';

interface WorkshopPostProps {
  post: Post;
}

export function WorkshopPost({ post }: WorkshopPostProps) {
  const { joinWorkshop } = useCommunity();
  const metadata = post.metadata as any;

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-colors" data-testid={`workshop-post-${post.id}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={metadata?.author?.avatar} 
          alt="User Avatar" 
          className="w-12 h-12 rounded-full object-cover"
          data-testid={`workshop-author-avatar-${post.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`workshop-author-name-${post.id}`}>
              {metadata?.author?.name}
            </h3>
            <span className="text-sm text-muted-foreground">in</span>
            <span className="text-sm text-primary font-medium" data-testid={`workshop-category-${post.id}`}>
              #{post.category}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`workshop-time-${post.id}`}>
              • {metadata?.timeAgo}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors" data-testid={`workshop-title-${post.id}`}>
            {post.title}
          </h2>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 mb-4 rounded-lg" data-testid={`workshop-details-${post.id}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Users className="text-primary h-4 w-4" />
              <span className="font-medium">Collaborative Project</span>
              <Badge className="bg-primary text-primary-foreground text-xs" data-testid={`workshop-writers-count-${post.id}`}>
                {metadata?.currentWriters || 0}/{metadata?.maxWriters || 5} Writers
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground" data-testid={`workshop-project-details-${post.id}`}>
              Genre: {metadata?.genre} • Target: {metadata?.targetWords} • Timeline: {metadata?.timeline}
            </p>
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`workshop-content-${post.id}`}>
            {post.content}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" data-testid={`workshop-tags-${post.id}`}>
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm" data-testid={`workshop-tag-${post.id}-${index}`}>
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-destructive transition-colors" data-testid={`workshop-like-${post.id}`}>
                <i className="fas fa-heart"></i>
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`workshop-comment-${post.id}`}>
                <i className="fas fa-comment"></i>
                <span className="text-sm">{post.replies} replies</span>
              </button>
            </div>
            <Button 
              onClick={() => joinWorkshop(post.id)}
              data-testid={`workshop-join-${post.id}`}
            >
              Join Project
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
