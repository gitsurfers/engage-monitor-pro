
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Feed } from '@/components/feed/Feed';
import { useMonitor } from '@/hooks/useMonitor';
import { useFeed } from '@/hooks/useFeed';
import { useComments } from '@/hooks/useComments';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  
  const { 
    settings, 
    addKeyword, 
    removeKeyword, 
    addUserId, 
    removeUserId, 
    updateAutoEngagement 
  } = useMonitor();
  
  const {
    comments,
    isLoading: isLoadingComments,
    addComment,
    deleteComment,
    toggleCommentStatus
  } = useComments();
  
  const { posts, isLoading, toggleLike, addComment: postComment } = useFeed(settings);

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
        comments={comments}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        onToggleCommentStatus={toggleCommentStatus}
        isLoadingComments={isLoadingComments}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        profile={profile}
      />
      
      {/* Center Section - Feed */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Twitter Feed</h1>
            <div className="flex items-center gap-4">
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
            onComment={postComment}
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Monitored Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{settings.keywords.length}</p>
                  <p className="text-sm text-muted-foreground">Keywords</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{comments.length}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${posts.length > 0 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <p>{posts.length > 0 ? 'Connected' : 'Ready to connect'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
