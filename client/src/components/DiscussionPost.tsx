import { PostCard } from './PostCard';
import { Post } from '@shared/schema';

interface DiscussionPostProps {
  post: Post;
}

export function DiscussionPost({ post }: DiscussionPostProps) {
  return <PostCard post={post} />;
}
