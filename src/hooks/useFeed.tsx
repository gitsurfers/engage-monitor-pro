
import { useState, useEffect } from 'react';
import { MonitorSettings } from './useMonitor';

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

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/twitter/get-all-twitter-posts', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          const formattedPosts: Post[] = result.data.map(post => ({
            id: post.id,
            tweet_id: post.tweet_id,
            username: post.screen_name,
            userDisplayName: post.name,
            userAvatar: post.profile_image_url,
            content: post.tweet_text,
            timestamp: new Date(post.created_at),
            likes: post.bookmark_count,
            comments: post.reply_count,
            shares: post.retweet_count,
            views: post.views,
            isLiked: post.liked,
            media_url: post.media_url,
            duration_millis: post.duration_millis,
            post_type: post.post_type,
            commented: post.commented,
            comment: post.comment,
            matchedKeyword: findMatchedKeyword(post.tweet_text, settings.keywords),
            matchedUserId: settings.userIds.some(u => u.username.toLowerCase() === post.screen_name.toLowerCase()) 
              ? post.screen_name 
              : undefined
          }));
          
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [settings]);

  // Helper function to check if a tweet matches any monitored keywords
  const findMatchedKeyword = (text: string, keywords: Array<{text: string}>) => {
    if (!text || !keywords.length) return undefined;
    
    const matchedKeyword = keywords.find(k => 
      text.toLowerCase().includes(k.text.toLowerCase())
    );
    
    return matchedKeyword ? matchedKeyword.text : undefined;
  };

  return {
    posts,
    isLoading,
    addNewPost,
    toggleLike,
    addComment
  };
}
