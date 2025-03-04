
import React, { useState } from 'react';
import { CustomCard } from '@/components/ui/CustomCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Heart, Share2, Eye } from 'lucide-react';
import { Post } from '@/hooks/useFeed';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface FeedProps {
  posts: Post[];
  isLoading: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
}

export function Feed({ posts, isLoading, onLike, onComment }: FeedProps) {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const toggleCommentSection = (postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleSubmitComment = (postId: string) => {
    const comment = commentInputs[postId];
    if (comment && comment.trim()) {
      onComment(postId, comment);
      // Clear the input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        {[1, 2, 3].map((i) => (
          <CustomCard key={i} className="animate-pulse">
            <div className="flex items-start space-x-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CustomCard>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] px-4">
        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-2xl font-semibold">No posts to display</h3>
          <p className="text-muted-foreground">
            Add keywords or users to monitor to start seeing posts in your feed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-2rem)] pr-4">
      <div className="space-y-4 pb-8">
        {posts.map((post) => (
          <CustomCard 
            key={post.id} 
            highlight={!!post.matchedKeyword || !!post.matchedUserId}
            isNew={Date.now() - post.timestamp.getTime() < 60000} // Less than a minute old
          >
            <div className="flex items-start space-x-3 mb-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={post.userAvatar} alt={post.userDisplayName} />
                <AvatarFallback>{post.userDisplayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold">{post.userDisplayName}</p>
                  <p className="text-sm text-muted-foreground">@{post.username}</p>
                  <p className="text-xs text-muted-foreground">· {formatTimestamp(post.timestamp)}</p>
                </div>
                {(post.matchedKeyword || post.matchedUserId) && (
                  <div className="flex space-x-2 mt-1">
                    {post.matchedKeyword && (
                      <Badge variant="outline" className="bg-primary/10 text-xs">
                        Keyword: {post.matchedKeyword}
                      </Badge>
                    )}
                    {post.matchedUserId && (
                      <Badge variant="outline" className="bg-primary/10 text-xs">
                        Monitored User
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <p className="mb-4 text-sm leading-relaxed">{post.content}</p>
            
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground"
                onClick={() => toggleCommentSection(post.id)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                onClick={() => onLike(post.id)}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground"
              >
                <Share2 className="h-4 w-4" />
                <span>{post.shares}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground"
              >
                <Eye className="h-4 w-4" />
                <span>Details</span>
              </Button>
            </div>
            
            {expandedComments[post.id] && (
              <div className="mt-4 space-y-3">
                <Separator />
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitComment(post.id);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => handleSubmitComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}
          </CustomCard>
        ))}
      </div>
    </ScrollArea>
  );
}
