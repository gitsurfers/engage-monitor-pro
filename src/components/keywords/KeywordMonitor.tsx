
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus } from 'lucide-react';
import type { Keyword } from '@/hooks/useMonitor';

interface KeywordMonitorProps {
  keywords: Keyword[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (id: string) => void;
}

export function KeywordMonitor({ keywords, onAddKeyword, onRemoveKeyword }: KeywordMonitorProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      onAddKeyword(newKeyword.trim());
      setNewKeyword('');
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
        />
        <Button onClick={handleAddKeyword} size="icon">
          <Plus className="h-4 w-4" />
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
                    onClick={() => onRemoveKeyword(keyword.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  >
                    <X className="h-3.5 w-3.5" />
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
