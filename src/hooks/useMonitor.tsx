
import { useState, useCallback, useEffect } from 'react';
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

// Helper functions for cookie storage
const saveKeywordsToCookies = (keywords: Keyword[]) => {
  try {
    // Store just the array of strings
    const keywordStrings = keywords.map(k => k.text);
    document.cookie = `monitor_keywords=${JSON.stringify(keywordStrings)};path=/;max-age=86400`; // Expires in 1 day
  } catch (error) {
    console.error('Error saving keywords to cookies:', error);
  }
};

const getKeywordsFromCookies = (): Keyword[] => {
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('monitor_keywords='));
    
    if (!cookieValue) return [];
    
    // Extract the value part
    const keywordsJson = cookieValue.split('=')[1];
    
    // Convert the array of strings back to Keyword objects with IDs
    const keywordStrings: string[] = JSON.parse(keywordsJson);
    return keywordStrings.map(text => ({
      id: crypto.randomUUID(),
      text
    }));
  } catch (error) {
    console.error('Error retrieving keywords from cookies:', error);
    return [];
  }
};

export function useMonitor() {
  const [settings, setSettings] = useState<MonitorSettings>({
    keywords: getKeywordsFromCookies(),
    userIds: [],
    autoEngagement: {
      enabled: false,
      autoLike: false,
      autoComment: false,
      selectedAccounts: [],
    },
  });
  
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch('http://localhost:3000/twitter/get-queries', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch keywords');
        }
        
        const data = await response.json();
        
        const keywords = data.queries.map((item: { query: string }) => ({
          id: crypto.randomUUID(),
          text: item.query
        }));
        
        setSettings(prev => ({
          ...prev,
          keywords
        }));
        
        // Save to cookies
        saveKeywordsToCookies(keywords);
      } catch (error) {
        console.error('Error fetching keywords:', error);
        toast({
          title: "Failed to load keywords",
          description: "Could not retrieve your saved keywords.",
          variant: "destructive"
        });
      }
    };
    
    fetchKeywords();
  }, []);

  const addKeyword = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const exists = settings.keywords.some(k => k.text.toLowerCase() === text.toLowerCase());
    if (exists) {
      toast({
        title: "Keyword already exists",
        description: `"${text}" is already in your monitoring list.`,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/twitter/add-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ query: text })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add keyword');
      }
      
      const newKeyword = { id: crypto.randomUUID(), text };
      const updatedKeywords = [...settings.keywords, newKeyword];
      
      setSettings(prev => ({
        ...prev,
        keywords: updatedKeywords,
      }));
      
      // Save to cookies
      saveKeywordsToCookies(updatedKeywords);
      
      toast({
        title: "Keyword added",
        description: `Now monitoring for "${text}".`,
      });
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Failed to add keyword",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  }, [settings.keywords]);

  const removeKeyword = useCallback(async (id: string) => {
    const keywordToRemove = settings.keywords.find(k => k.id === id);
    
    if (!keywordToRemove) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/twitter/remove-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ query: keywordToRemove.text })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove keyword');
      }
      
      const updatedKeywords = settings.keywords.filter(k => k.id !== id);
      
      setSettings(prev => ({
        ...prev,
        keywords: updatedKeywords,
      }));
      
      // Save to cookies
      saveKeywordsToCookies(updatedKeywords);
      
      toast({
        title: "Keyword removed",
        description: "Monitoring settings updated.",
      });
    } catch (error) {
      console.error('Error removing keyword:', error);
      toast({
        title: "Failed to remove keyword",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  }, [settings.keywords]);

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
