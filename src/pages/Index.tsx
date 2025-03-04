
import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Feed } from '@/components/feed/Feed';
import { useMonitor } from '@/hooks/useMonitor';
import { useFeed } from '@/hooks/useFeed';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { 
    settings, 
    addKeyword, 
    removeKeyword, 
    addUserId, 
    removeUserId, 
    updateAutoEngagement 
  } = useMonitor();
  
  const { posts, isLoading, toggleLike, addComment } = useFeed(settings);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      />
      
      {/* Center Section - Feed */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Social Media Feed</h1>
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
          
          <Feed 
            posts={posts}
            isLoading={isLoading}
            onLike={toggleLike}
            onComment={addComment}
          />
        </div>
      </div>
      
      {/* Right Section - Empty for future features */}
      <div className="hidden lg:block w-80 h-screen border-l border-border p-4 glass-morphism">
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <h3 className="text-xl font-semibold mb-2">Future Enhancements</h3>
          <p className="text-muted-foreground mb-6">
            This section is reserved for upcoming features such as analytics, notifications, and user insights.
          </p>
          <div className="w-full h-40 rounded-lg border border-dashed border-muted-foreground/50 flex items-center justify-center mb-4">
            <span className="text-sm text-muted-foreground">Analytics Dashboard</span>
          </div>
          <div className="w-full h-40 rounded-lg border border-dashed border-muted-foreground/50 flex items-center justify-center mb-4">
            <span className="text-sm text-muted-foreground">Engagement Reports</span>
          </div>
          <div className="w-full h-40 rounded-lg border border-dashed border-muted-foreground/50 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Notification Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
