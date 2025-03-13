import { useState, useEffect, useCallback, useRef } from 'react';
import { MonitorSettings } from './useMonitor';
import { toast } from 'sonner';

export type Post = {
  id: string;
  tweet_id: string;
  username: string; // screen_name
  userDisplayName: string; // name
  userAvatar: string; // profile_image_url
  content: string; // tweet_text
  timestamp: Date; // created_at
  likes: number; // bookmark_count
  comments: number; // reply_count
  shares: number; // retweet_count
  views: number;
  isLiked: boolean; // liked
  matchedKeyword?: string;
  matchedUserId?: string;
  media_url?: string;
  duration_millis?: number;
  post_type: 'text' | 'image' | 'video';
  commented: boolean;
  comment?: string;
};

export function useFeed(settings: MonitorSettings) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Add a new post to the feed
  const addNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  // Toggle like on a post
  const toggleLike = async (postId: string) => {
    try {
      // In a real app, you would call an API to like/unlike the post
      setPosts(prev => 
        prev.map(post => 
          post.tweet_id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked, 
                likes: post.isLiked ? post.likes - 1 : post.likes + 1 
              } 
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, comment: string) => {
    if (!comment.trim()) return;
    
    try {
      // In a real app, you would call an API to add the comment
      setPosts(prev => 
        prev.map(post => 
          post.tweet_id === postId 
            ? { 
                ...post, 
                comments: post.comments + 1,
                commented: true,
                comment: comment
              } 
            : post
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Helper function to check if a tweet matches any monitored keywords
  const findMatchedKeyword = (text: string, keywords: Array<{text: string}>) => {
    if (!text || !keywords.length) return undefined;
    
    const matchedKeyword = keywords.find(k => 
      text.toLowerCase().includes(k.text.toLowerCase())
    );
    
    return matchedKeyword ? matchedKeyword.text : undefined;
  };

  // Fetch posts from the API
  const fetchPosts = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    // Don't set loading state for background refreshes if we already have posts
    const isInitialLoad = posts.length === 0;
    if (isInitialLoad) {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/twitter/get-all-twitter-posts', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch posts, server response:', errorText);
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Fetched posts result:', result);
      
      if (result.data && Array.isArray(result.data)) {
        const formattedPosts: Post[] = result.data.map(post => ({
          id: post.id,
          tweet_id: post.tweet_id,
          username: post.screen_name,
          userDisplayName: post.name,
          userAvatar: post.profile_image_url,
          content: post.tweet_text,
          timestamp: new Date(post.created_at),
          likes: post.bookmark_count || 0,
          comments: post.reply_count || 0,
          shares: post.retweet_count || 0,
          views: post.views || 0,
          isLiked: post.liked || false,
          media_url: post.media_url,
          duration_millis: post.duration_millis,
          post_type: post.post_type || 'text',
          commented: post.commented || false,
          comment: post.comment,
          matchedKeyword: findMatchedKeyword(post.tweet_text, settings.keywords),
          matchedUserId: settings.userIds.some(u => u.username.toLowerCase() === post.screen_name?.toLowerCase()) 
            ? post.screen_name 
            : undefined
        }));
        
        if (isMountedRef.current) {
          setPosts(formattedPosts);
          if (formattedPosts.length > 0) {
            toast.success(`Loaded ${formattedPosts.length} posts`);
          }
        }
      } else {
        console.warn('Unexpected API response format:', result);
        if (isMountedRef.current && posts.length === 0) {
          // Only set empty posts if we don't have any yet (to prevent flickering)
          setPosts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError((error as Error).message || 'Failed to fetch posts');
      
      // If this is an initial load with no posts, show a mock post for debugging
      if (isInitialLoad && isMountedRef.current) {
        // Keep existing posts if any instead of showing empty state
        if (posts.length === 0) {
          toast.error('Error loading posts. Please check your connection and try again.');
        }
      }
    } finally {
      if (isMountedRef.current && isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [posts.length, settings]);
  
  // Set up automatic refresh
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchPosts();
    
    // Set up interval for refreshing posts every 20 seconds
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing posts...');
      if (isMountedRef.current) {
        fetchPosts();
      }
    }, 20000);
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    addNewPost,
    toggleLike,
    addComment,
    refreshPosts: fetchPosts
  };
}
