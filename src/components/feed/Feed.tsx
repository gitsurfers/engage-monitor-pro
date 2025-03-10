
import React, { useState, useRef } from 'react';
import { CustomCard } from '@/components/ui/CustomCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Heart, Share2, Eye, Play, ExternalLink } from 'lucide-react';
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
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

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
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
    }
  };

  const formatVideoDuration = (milliseconds: number) => {
    if (!milliseconds) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayVideo = (postId: string) => {
    if (playingVideo === postId) {
      const videoElement = videoRefs.current[postId];
      if (videoElement) {
        if (videoElement.paused) {
          videoElement.play();
        } else {
          videoElement.pause();
        }
      }
    } else {
      if (playingVideo && videoRefs.current[playingVideo]) {
        videoRefs.current[playingVideo]?.pause();
      }
      
      setPlayingVideo(postId);
      const videoElement = videoRefs.current[postId];
      if (videoElement) {
        videoElement.play();
      }
    }
  };

  const openTwitterPost = (username: string, tweetId: string) => {
    window.open(`https://x.com/${username}/status/${tweetId}`, '_blank');
  };

  const openTwitterProfile = (username: string) => {
    window.open(`https://x.com/${username}`, '_blank');
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
            isNew={Date.now() - post.timestamp.getTime() < 60000}
          >
            <div className="flex items-start space-x-3 mb-3">
              <Avatar 
                className="h-10 w-10 border cursor-pointer" 
                onClick={() => openTwitterProfile(post.username)}
              >
                <AvatarImage src={post.userAvatar} alt={post.userDisplayName} />
                <AvatarFallback>{post.userDisplayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p 
                    className="font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    onClick={() => openTwitterProfile(post.username)}
                  >
                    {post.userDisplayName}
                    <ExternalLink className="h-3 w-3" />
                  </p>
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
            
            <div 
              className="mb-3 cursor-pointer" 
              onClick={() => openTwitterPost(post.username, post.tweet_id)}
            >
              <p className="text-sm leading-relaxed mb-3">{post.content}</p>
              
              {post.post_type === 'image' && post.media_url && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.media_url} 
                    alt="Post image" 
                    className="w-full max-h-[350px] object-contain bg-black/5"
                    loading="lazy"
                  />
                </div>
              )}
              
              {post.post_type === 'video' && post.media_url && (
                <div className="rounded-lg overflow-hidden">
                  <div 
                    className="relative aspect-video max-h-[300px] bg-black flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVideo(post.tweet_id);
                    }}
                  >
                    <video
                      ref={ref => videoRefs.current[post.tweet_id] = ref}
                      src=""
                      poster={post.media_url}
                      className="max-h-[300px] w-auto mx-auto"
                      preload="metadata"
                    />
                    {(!playingVideo || playingVideo !== post.tweet_id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-primary/80 text-white flex items-center justify-center">
                          <Play className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    )}
                    {post.duration_millis && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
                        {formatVideoDuration(post.duration_millis)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${post.commented ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => toggleCommentSection(post.tweet_id)}
              >
                <MessageSquare className={`h-4 w-4 ${post.commented ? 'fill-primary/20' : ''}`} />
                <span>{post.comments}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                onClick={() => onLike(post.tweet_id)}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500' : ''}`} />
                <span>{post.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground"
                onClick={() => openTwitterPost(post.username, post.tweet_id)}
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
                <span>{post.views}</span>
              </Button>
            </div>
            
            {/* Always show comment section if there's a comment */}
            {(expandedComments[post.tweet_id] || (post.comment && post.comment.trim() !== '')) && (
              <div className="mt-4 space-y-3">
                <Separator />
                
                {post.comment && post.comment.trim() !== '' && (
                  <div className="flex space-x-2 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-secondary/20 p-2 rounded-lg">
                      <p className="text-sm font-medium">You</p>
                      <p className="text-sm">{post.comment}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentInputs[post.tweet_id] || ''}
                    onChange={(e) => handleCommentChange(post.tweet_id, e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitComment(post.tweet_id);
                      }
                    }}
                  />
                  <Button 
                    onClick={() => handleSubmitComment(post.tweet_id)}
                    disabled={!commentInputs[post.tweet_id]?.trim()}
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
