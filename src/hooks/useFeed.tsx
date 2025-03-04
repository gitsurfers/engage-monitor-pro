
import { useState, useEffect } from 'react';
import { MonitorSettings } from './useMonitor';

export type Post = {
  id: string;
  username: string;
  userDisplayName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  matchedKeyword?: string;
  matchedUserId?: string;
  type: 'post' | 'comment' | 'like' | 'engagement';
};

// Sample posts data for our demo
const samplePosts: Post[] = [
  {
    id: '1',
    username: 'elonmusk',
    userDisplayName: 'Elon Musk',
    userAvatar: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    content: 'The Cybertruck delivery event will be streamed live on X',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    likes: 8954,
    comments: 1232,
    shares: 456,
    isLiked: false,
    type: 'post'
  },
  {
    id: '2',
    username: 'BillGates',
    userDisplayName: 'Bill Gates',
    userAvatar: 'https://pbs.twimg.com/profile_images/1674815862879178752/nTGMV1Eo_400x400.jpg',
    content: 'AI is going to change how people work, learn, travel, get health care, and communicate with each other. Businesses will work differently.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
    likes: 5432,
    comments: 897,
    shares: 321,
    isLiked: true,
    type: 'post'
  },
  {
    id: '3',
    username: 'tim_cook',
    userDisplayName: 'Tim Cook',
    userAvatar: 'https://pbs.twimg.com/profile_images/1535420431766671360/Pwq-1eJc_400x400.jpg',
    content: 'Introducing our most capable iPhone ever. iPhone 15 Pro is designed with aerospace-grade titanium, making it our lightest Pro model yet.',
    timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 mins ago
    likes: 7123,
    comments: 1452,
    shares: 876,
    isLiked: false,
    type: 'post'
  },
  {
    id: '4',
    username: 'satyanadella',
    userDisplayName: 'Satya Nadella',
    userAvatar: 'https://pbs.twimg.com/profile_images/1221837516816306177/_Ld4un5A_400x400.jpg',
    content: 'Announcing new breakthroughs in the developer experience – AI-assisted code reviews and project planning in GitHub.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    likes: 3421,
    comments: 564,
    shares: 234,
    isLiked: false,
    matchedKeyword: 'AI',
    type: 'post'
  },
  {
    id: '5',
    username: 'sundarpichai',
    userDisplayName: 'Sundar Pichai',
    userAvatar: 'https://pbs.twimg.com/profile_images/864282616597405701/M-FEJMZ0_400x400.jpg',
    content: "Introducing the next generation of search with an entirely new experience within Google Search. It's a more personal, natural, and conversational way to get help.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    likes: 6789,
    comments: 1234,
    shares: 567,
    isLiked: true,
    type: 'post'
  }
];

// This is a mock function to simulate getting real-time posts
// In a real app, this would connect to an API or websocket
function simulateRealtimePosts(settings: MonitorSettings): Post[] {
  return samplePosts.filter(post => {
    // Filter based on user IDs
    if (settings.userIds.some(u => u.username.toLowerCase() === post.username.toLowerCase())) {
      return true;
    }
    
    // Filter based on keywords
    if (settings.keywords.some(k => 
      post.content.toLowerCase().includes(k.text.toLowerCase())
    )) {
      return true;
    }
    
    // If no filters are active, return all posts
    return settings.keywords.length === 0 && settings.userIds.length === 0;
  });
}

export function useFeed(settings: MonitorSettings) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add a new post to the feed (used for demo purposes)
  const addNewPost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
  };

  // Toggle like on a post
  const toggleLike = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            } 
          : post
      )
    );
  };

  // Add a comment to a post
  const addComment = (postId: string, comment: string) => {
    if (!comment.trim()) return;
    
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      )
    );
  };

  // Simulate initial load and real-time updates
  useEffect(() => {
    const loadPosts = () => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const filteredPosts = simulateRealtimePosts(settings);
        setPosts(filteredPosts);
        setIsLoading(false);
      }, 1000);
    };

    loadPosts();

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      const newPost: Post = {
        id: crypto.randomUUID(),
        username: 'newuser' + Math.floor(Math.random() * 1000),
        userDisplayName: 'New User',
        userAvatar: 'https://ui-avatars.com/api/?name=New+User&background=random',
        content: 'This is a new real-time post with some random content about AI and technology.',
        timestamp: new Date(),
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        isLiked: false,
        type: 'post',
        matchedKeyword: settings.keywords.length > 0 ? settings.keywords[0].text : undefined
      };
      
      // Only add the post if it matches our filters or we have no filters
      if (settings.keywords.length === 0 && settings.userIds.length === 0) {
        addNewPost(newPost);
      } else if (newPost.matchedKeyword) {
        addNewPost(newPost);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings]);

  return {
    posts,
    isLoading,
    addNewPost,
    toggleLike,
    addComment
  };
}
