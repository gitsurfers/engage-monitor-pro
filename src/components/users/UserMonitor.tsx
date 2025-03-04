
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, AtSign } from 'lucide-react';
import type { UserID } from '@/hooks/useMonitor';

interface UserMonitorProps {
  userIds: UserID[];
  onAddUserId: (userId: string) => void;
  onRemoveUserId: (id: string) => void;
}

export function UserMonitor({ userIds, onAddUserId, onRemoveUserId }: UserMonitorProps) {
  const [newUserId, setNewUserId] = useState('');

  const handleAddUserId = () => {
    if (newUserId.trim()) {
      onAddUserId(newUserId.trim().replace('@', ''));
      setNewUserId('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUserId();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in p-1">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add a username to monitor..."
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-9"
          />
        </div>
        <Button onClick={handleAddUserId} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-2">
        <ScrollArea className="h-[180px] rounded-md border p-4">
          {userIds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users added yet. Add usernames to start monitoring.
            </p>
          ) : (
            <div className="space-y-2">
              {userIds.map((user) => (
                <div 
                  key={user.id}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center">
                    <AtSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveUserId(user.id)}
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
