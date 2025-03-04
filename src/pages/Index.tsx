
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Feed } from '@/components/feed/Feed';
import { useMonitor } from '@/hooks/useMonitor';
import { useFeed } from '@/hooks/useFeed';
import { Toaster } from '@/components/ui/sonner';
import { toast } from '@/components/ui/use-toast';
import io from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  
  const { 
    settings, 
    addKeyword, 
    removeKeyword, 
    addUserId, 
    removeUserId, 
    updateAutoEngagement 
  } = useMonitor();
  
  const { posts, isLoading, toggleLike, addComment, addNewPost } = useFeed(settings);

  // Fetch profile data from backend
  useEffect(() => {
    fetch('http://localhost:3000/profile', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((data) => setProfile(data.user))
      .catch((err) => {
        console.error(err);
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  // Establish Socket.io connection once profile is loaded
  useEffect(() => {
    if (profile) {
      const socket = io('http://localhost:3000', { withCredentials: true });
      
      socket.on('connect', () => {
        toast({
          title: "Connected to stream",
          description: "You'll now receive real-time Twitter updates",
        });
      });
      
      socket.on('tweet', (tweet) => {
        setTweets((prev) => [tweet, ...prev]);
        
        // Convert Twitter API tweet to our app's post format
        if (tweet.data?.text) {
          const newPost = {
            id: tweet.data.id || crypto.randomUUID(),
            username: profile.username,
            userDisplayName: profile.displayName,
            userAvatar: profile.photos?.[0]?.value || '',
            content: tweet.data.text,
            timestamp: new Date(tweet.data.created_at || Date.now()),
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            type: 'post' as const,  // This explicitly sets the type to a literal type
            matchedKeyword: findMatchedKeyword(tweet.data.text, settings.keywords)
          };
          
          addNewPost(newPost);
        }
      });
      
      socket.on('disconnect', () => {
        toast({
          title: "Disconnected from stream",
          description: "Connection to Twitter stream was lost",
          variant: "destructive"
        });
      });
      
      return () => socket.disconnect();
    }
  }, [profile, settings.keywords]);

  // Helper function to check if a tweet matches any monitored keywords
  const findMatchedKeyword = (text, keywords) => {
    if (!text || !keywords.length) return undefined;
    
    const matchedKeyword = keywords.find(k => 
      text.toLowerCase().includes(k.text.toLowerCase())
    );
    
    return matchedKeyword ? matchedKeyword.text : undefined;
  };

  // Call backend endpoint to start tweet stream
  const startStream = async () => {
    if (!profile) return;
    
    setIsConnecting(true);
    try {
      const res = await fetch('http://localhost:3000/start-stream', { credentials: 'include' });
      const data = await res.json();
      console.log('Stream started:', data);
      toast({
        title: "Stream started",
        description: "You should now start receiving tweets"
      });
    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Failed to start stream",
        description: "Check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Toaster position="top-right" />
      
      {/* Left Section - Sidebar */}
      <Sidebar 
        settings={settings}
        onAddKeyword={addKeyword}
        onRemoveKeyword={removeKeyword}
        onAddUserId={addUserId}
        onRemoveUserId={removeUserId}
        onUpdateAutoEngagement={updateAutoEngagement}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        profile={profile}
      />
      
      {/* Center Section - Feed */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Social Media Feed</h1>
            <div className="flex items-center gap-4">
              <Button 
                onClick={startStream} 
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Start Stream
              </Button>
              <div className="text-sm text-muted-foreground">
                {settings.keywords.length > 0 || settings.userIds.length > 0 ? (
                  <span>
                    Monitoring {settings.keywords.length} keywords and {settings.userIds.length} users
                  </span>
                ) : (
                  <span>No active filters</span>
                )}
              </div>
            </div>
          </div>
          
          <Feed 
            posts={posts}
            isLoading={isLoading}
            onLike={toggleLike}
            onComment={addComment}
          />
        </div>
      </div>
      
      {/* Right Section - User Profile */}
      <div className="hidden lg:block w-80 h-screen border-l border-border p-4 glass-morphism">
        <div className="h-full flex flex-col items-center p-6">
          <div className="text-center mb-8">
            <Avatar className="h-24 w-24 mb-4 mx-auto">
              <AvatarImage src={profile.photos?.[0]?.value || ''} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.displayName}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          <div className="w-full space-y-6">
            <div className="p-4 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Account Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{tweets.length}</p>
                  <p className="text-sm text-muted-foreground">Monitored Tweets</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{settings.keywords.length}</p>
                  <p className="text-sm text-muted-foreground">Keywords</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${tweets.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <p>{tweets.length > 0 ? 'Connected' : 'Ready to connect'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
