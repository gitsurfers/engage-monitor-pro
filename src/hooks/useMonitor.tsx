
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export type Keyword = {
  id: string;
  text: string;
};

export type UserID = {
  id: string;
  username: string;
};

export type MonitorSettings = {
  keywords: Keyword[];
  userIds: UserID[];
  autoEngagement: {
    enabled: boolean;
    autoLike: boolean;
    autoComment: boolean;
    selectedAccounts: string[];
  };
};

export function useMonitor() {
  const [settings, setSettings] = useState<MonitorSettings>({
    keywords: [],
    userIds: [],
    autoEngagement: {
      enabled: false,
      autoLike: false,
      autoComment: false,
      selectedAccounts: [],
    },
  });

  const addKeyword = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const exists = settings.keywords.some(k => k.text.toLowerCase() === text.toLowerCase());
    if (exists) {
      toast({
        title: "Keyword already exists",
        description: `"${text}" is already in your monitoring list.`,
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      keywords: [...prev.keywords, { id: crypto.randomUUID(), text }],
    }));
    
    toast({
      title: "Keyword added",
      description: `Now monitoring for "${text}".`,
    });
  }, [settings.keywords]);

  const removeKeyword = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k.id !== id),
    }));
    
    toast({
      title: "Keyword removed",
      description: "Monitoring settings updated.",
    });
  }, []);

  const addUserId = useCallback((username: string) => {
    if (!username.trim()) return;
    
    const exists = settings.userIds.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      toast({
        title: "User already exists",
        description: `"${username}" is already in your monitoring list.`,
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      userIds: [...prev.userIds, { id: crypto.randomUUID(), username }],
    }));
    
    toast({
      title: "User added",
      description: `Now monitoring @${username}.`,
    });
  }, [settings.userIds]);

  const removeUserId = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      userIds: prev.userIds.filter(u => u.id !== id),
    }));
    
    toast({
      title: "User removed",
      description: "Monitoring settings updated.",
    });
  }, []);

  const updateAutoEngagement = useCallback((settings: Partial<MonitorSettings['autoEngagement']>) => {
    setSettings(prev => ({
      ...prev,
      autoEngagement: {
        ...prev.autoEngagement,
        ...settings,
      },
    }));
    
    toast({
      title: "Settings updated",
      description: "Your auto engagement settings have been saved.",
    });
  }, []);

  return {
    settings,
    addKeyword,
    removeKeyword,
    addUserId,
    removeUserId,
    updateAutoEngagement,
  };
}
