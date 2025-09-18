import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post } from '@shared/schema';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ArtGalleryPostProps {
  post: Post;
}

export function ArtGalleryPost({ post }: ArtGalleryPostProps) {
  const metadata = post.metadata as any;
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  return (
    <>
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
          
          <h2 
            onClick={() => setShowGalleryModal(true)}
            className="text-xl font-bold text-foreground mb-3 hover:text-primary cursor-pointer transition-colors" 
            data-testid={`art-gallery-title-${post.id}`}
          >
            {post.title}
          </h2>
          
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4" data-testid={`art-gallery-images-${post.id}`}>
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Character Portrait ${index + 1}`} 
                  className="rounded-lg object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowGalleryModal(true)}
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
              <button 
                onClick={() => setShowGalleryModal(true)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors" 
                data-testid={`art-gallery-view-${post.id}`}
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">View Gallery</span>
              </button>
            </div>
            <Button 
              onClick={() => setShowCommissionModal(true)}
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
    
    {/* Gallery Modal */}
    <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="art-gallery-detail">
        <DialogHeader>
          <DialogTitle>Art Gallery - {post.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {post.images && post.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`Artwork ${index + 1}`} 
                className="rounded-lg object-cover w-full h-64"
              />
            ))}
          </div>
          <div>
            <h3 className="font-semibold mb-2">About this artwork</h3>
            <p className="text-muted-foreground">{post.content}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Commission Modal */}
    <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Commission {metadata?.author?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Interested in commissioning artwork from {metadata?.author?.name}? 
            Send them a message with your project details.
          </p>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Project Type</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>Character Design</option>
                <option>Book Cover</option>
                <option>Illustration</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Budget Range</label>
              <select className="w-full mt-1 p-2 border rounded-md">
                <option>$50-100</option>
                <option>$100-250</option>
                <option>$250-500</option>
                <option>$500+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Project Description</label>
              <textarea 
                className="w-full mt-1 p-2 border rounded-md" 
                rows={4}
                placeholder="Describe your project..."
              />
            </div>
            <Button className="w-full">Send Commission Request</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
