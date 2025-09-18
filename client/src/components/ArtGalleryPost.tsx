import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post } from '@shared/schema';

interface ArtGalleryPostProps {
  post: Post;
}

export function ArtGalleryPost({ post }: ArtGalleryPostProps) {
  const metadata = post.metadata as any;

  return (
    <article className="bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-colors" data-testid={`art-gallery-post-${post.id}`}>
      <div className="flex items-start space-x-4">
        <img 
          src={metadata?.author?.avatar} 
          alt="User Avatar" 
          className="w-12 h-12 rounded-full object-cover"
          data-testid={`art-gallery-author-avatar-${post.id}`}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`art-gallery-author-name-${post.id}`}>
              {metadata?.author?.name}
            </h3>
            <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground" data-testid={`art-gallery-author-role-${post.id}`}>
              {metadata?.author?.role}
            </Badge>
            <span className="text-sm text-muted-foreground">in</span>
            <span className="text-sm text-primary font-medium" data-testid={`art-gallery-category-${post.id}`}>
              #{post.category}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`art-gallery-time-${post.id}`}>
              • {metadata?.timeAgo}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors" data-testid={`art-gallery-title-${post.id}`}>
            {post.title}
          </h2>
          
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4" data-testid={`art-gallery-images-${post.id}`}>
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Character Portrait ${index + 1}`} 
                  className="rounded-lg object-cover aspect-square"
                  data-testid={`art-gallery-image-${post.id}-${index}`}
                />
              ))}
            </div>
          )}
          
          <p className="text-muted-foreground mb-4 leading-relaxed" data-testid={`art-gallery-content-${post.id}`}>
            {post.content}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4" data-testid={`art-gallery-tags-${post.id}`}>
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm" data-testid={`art-gallery-tag-${post.id}-${index}`}>
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-destructive transition-colors" data-testid={`art-gallery-like-${post.id}`}>
                <i className="fas fa-heart"></i>
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors" data-testid={`art-gallery-comment-${post.id}`}>
                <i className="fas fa-comment"></i>
                <span className="text-sm">{post.replies} replies</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors" data-testid={`art-gallery-view-${post.id}`}>
                <Eye className="h-4 w-4" />
                <span className="text-sm">View Gallery</span>
              </button>
            </div>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              data-testid={`art-gallery-commission-${post.id}`}
            >
              Commission Artist
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
