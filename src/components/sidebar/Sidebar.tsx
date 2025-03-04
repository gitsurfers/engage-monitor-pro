
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, User, Settings, LogOut } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { KeywordMonitor } from '@/components/keywords/KeywordMonitor';
import { UserMonitor } from '@/components/users/UserMonitor';
import { EngagementSettings } from '@/components/engagement/EngagementSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { MonitorSettings } from '@/hooks/useMonitor';

interface SidebarProps {
  settings: MonitorSettings;
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (id: string) => void;
  onAddUserId: (userId: string) => void;
  onRemoveUserId: (id: string) => void;
  onUpdateAutoEngagement: (settings: Partial<MonitorSettings['autoEngagement']>) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  profile: any; // Twitter profile data
}

export function Sidebar({
  settings,
  onAddKeyword,
  onRemoveKeyword,
  onAddUserId,
  onRemoveUserId,
  onUpdateAutoEngagement,
  isSidebarOpen,
  toggleSidebar,
  profile
}: SidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogout = () => {
    // Redirect to backend's logout endpoint
    window.location.href = 'http://localhost:3000/auth/logout';
  };

  if (!isSidebarOpen) {
    return (
      <div className="w-12 h-screen flex flex-col items-center pt-6 bg-sidebar border-r border-sidebar-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="mb-6"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div className="flex flex-col space-y-6">
          <Button variant="ghost" size="icon">
            <Hash className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-72 h-screen flex flex-col bg-sidebar border-r border-sidebar-border animate-slide-in overflow-hidden transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <h2 className="text-lg font-semibold">Monitor Settings</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* User Profile */}
      {profile && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={profile.photos?.[0]?.value || ''} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium line-clamp-1">{profile.displayName}</p>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <Collapsible
            open={openSection === 'keywords'}
            onOpenChange={() => toggleSection('keywords')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-2.5 font-medium"
              >
                <div className="flex items-center">
                  {openSection === 'keywords' ? (
                    <ChevronDown className="h-5 w-5 mr-2" />
                  ) : (
                    <ChevronRight className="h-5 w-5 mr-2" />
                  )}
                  <Hash className="h-5 w-5 mr-2" />
                  <span>Keywords</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4 px-2">
              <KeywordMonitor 
                keywords={settings.keywords}
                onAddKeyword={onAddKeyword}
                onRemoveKeyword={onRemoveKeyword}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSection === 'users'}
            onOpenChange={() => toggleSection('users')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-2.5 font-medium"
              >
                <div className="flex items-center">
                  {openSection === 'users' ? (
                    <ChevronDown className="h-5 w-5 mr-2" />
                  ) : (
                    <ChevronRight className="h-5 w-5 mr-2" />
                  )}
                  <User className="h-5 w-5 mr-2" />
                  <span>User IDs</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4 px-2">
              <UserMonitor 
                userIds={settings.userIds}
                onAddUserId={onAddUserId}
                onRemoveUserId={onRemoveUserId}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSection === 'engagement'}
            onOpenChange={() => toggleSection('engagement')}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-2.5 font-medium"
              >
                <div className="flex items-center">
                  {openSection === 'engagement' ? (
                    <ChevronDown className="h-5 w-5 mr-2" />
                  ) : (
                    <ChevronRight className="h-5 w-5 mr-2" />
                  )}
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Auto Engagement</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4 px-2">
              <EngagementSettings 
                settings={settings.autoEngagement}
                onUpdateSettings={onUpdateAutoEngagement}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Social Media Monitor v1.0
        </p>
      </div>
    </div>
  );
}

export function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
