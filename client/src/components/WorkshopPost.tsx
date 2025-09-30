import { Users, Heart, MessageCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post, WorkshopComment } from '@shared/schema';
import { useCommunity } from '@/contexts/SupabaseCommunityContext';
import { useState, useEffect } from 'react';

interface WorkshopPostProps {
  post: Post;
}

export function WorkshopPost({ post }: WorkshopPostProps) {
  const { } = useCommunity();
  
  // Placeholder functions for features not yet implemented
  const joinWorkshop = (workshopId: string) => console.log('Join workshop:', workshopId);
  const likePost = (postId: string) => console.log('Like post:', postId);
  const metadata = post.metadata as any;
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [userLikedWorkshops, setUserLikedWorkshops] = useState<Set<string>>(new Set());
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState<WorkshopComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = () => {
    const hasLiked = userLikedWorkshops.has(post.id);

    if (hasLiked) {
      // Remove like
      setUserLikedWorkshops(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
      setLocalLikes(prev => Math.max(0, (prev ?? 0) - 1));
    } else {
      // Add like
      setUserLikedWorkshops(prev => new Set(prev).add(post.id));
      setLocalLikes(prev => (prev ?? 0) + 1);
    }

    likePost(post.id);
  };

  // Fetch comments when modal opens
  useEffect(() => {
    if (showReplyModal && comments.length === 0) {
      fetchComments();
    }
  }, [showReplyModal]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/workshop-comments/${post.id}`);
      if (response.ok) {
        const fetchedComments = await response.json();
        setComments(fetchedComments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const response = await fetch('/api/workshop-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: replyText.trim(),
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [newComment, ...prev]);
        setReplyText('');
        // Update local replies count
        post.replies = (post.replies ?? 0) + 1;
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
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
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikedWorkshops.has(post.id)
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-destructive'
                }`} 
                data-testid={`workshop-like-${post.id}`}
              >
                <Heart className={`h-4 w-4 ${userLikedWorkshops.has(post.id) ? 'fill-current' : ''}`} />
                <span className="text-sm">{localLikes}</span>
              </button>
              <button 
                onClick={() => setShowReplyModal(true)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors" 
                data-testid={`workshop-comment-${post.id}`}
              >
                <MessageCircle className="h-4 w-4" />
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

    {/* Reply Modal */}
    <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comments - {post.title}</DialogTitle>
          <DialogDescription>
            View and add comments to this workshop post
          </DialogDescription>
        </DialogHeader>
        
        {/* Comment Form */}
        <div className="space-y-4">
          <Textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            placeholder="Write your comment..."
            className="text-white bg-gray-800 border-gray-600 placeholder:text-gray-400"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowReplyModal(false)}>Cancel</Button>
            <Button 
              onClick={submitComment}
              disabled={!replyText.trim() || isSubmittingComment}
              className="flex items-center gap-2"
            >
              {isSubmittingComment ? (
                <>Loading...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg text-white">Comments ({comments.length})</h3>
          
          {isLoadingComments ? (
            <div className="text-center py-4 text-white">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-gray-600 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                    <span className="font-medium text-sm text-white">User</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
                      <Heart className="w-3 h-3" />
                      {comment.likes || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
