
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, Loader2 } from 'lucide-react';
import type { Keyword } from '@/hooks/useMonitor';

interface KeywordMonitorProps {
  keywords: Keyword[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (id: string) => void;
}

export function KeywordMonitor({ keywords, onAddKeyword, onRemoveKeyword }: KeywordMonitorProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleAddKeyword = async () => {
    if (newKeyword.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddKeyword(newKeyword.trim());
        setNewKeyword('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    if (isRemoving) return;
    
    setIsRemoving(id);
    try {
      await onRemoveKeyword(id);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in p-1">
      <div className="flex space-x-2">
        <Input
          placeholder="Add a keyword to monitor..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          onClick={handleAddKeyword} 
          size="icon"
          disabled={isSubmitting || !newKeyword.trim()}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="mt-2">
        <ScrollArea className="h-[180px] rounded-md border p-4">
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No keywords added yet. Add keywords to start monitoring.
            </p>
          ) : (
            <div className="space-y-2">
              {keywords.map((keyword) => (
                <div 
                  key={keyword.id}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-accent/30 transition-colors"
                >
                  <span className="text-sm font-medium">{keyword.text}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveKeyword(keyword.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    disabled={isRemoving === keyword.id}
                  >
                    {isRemoving === keyword.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
