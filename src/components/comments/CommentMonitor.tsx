
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Plus, MessageSquare, Loader2, Check, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export interface Comment {
  id: number;
  comment_text: string;
  is_active: boolean;
}

interface CommentMonitorProps {
  comments: Comment[];
  onAddComment: (comment: string) => Promise<void>;
  onDeleteComment: (id: number) => Promise<void>;
  onToggleCommentStatus: (id: number, isActive: boolean) => Promise<void>;
  isLoading: boolean;
}

export function CommentMonitor({ 
  comments, 
  onAddComment, 
  onDeleteComment, 
  onToggleCommentStatus,
  isLoading 
}: CommentMonitorProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const handleAddComment = async () => {
    if (newComment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddComment(newComment.trim());
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (actionInProgress !== null) return;
    
    setActionInProgress(id);
    try {
      await onDeleteComment(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (actionInProgress !== null) return;
    
    setActionInProgress(id);
    try {
      await onToggleCommentStatus(id, !currentStatus);
    } catch (error) {
      console.error('Error toggling comment status:', error);
      toast.error('Failed to update comment status');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        <div className="flex space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
        <ScrollArea className="h-[180px] rounded-md border p-4">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in p-1">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add a comment template..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-9"
            disabled={isSubmitting}
          />
        </div>
        <Button 
          onClick={handleAddComment} 
          size="icon" 
          disabled={isSubmitting || !newComment.trim()}
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
          {comments.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-70" />
              <p>No comments added yet. Add comment templates to automatically respond to posts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div 
                  key={comment.id}
                  className={`group flex items-center justify-between p-2 rounded-md hover:bg-accent/30 transition-colors ${!comment.is_active ? 'opacity-70' : ''}`}
                >
                  <div className="flex-1 mr-2">
                    <p className="text-sm font-medium line-clamp-1">{comment.comment_text}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 min-w-[60px]">
                      <Switch
                        checked={comment.is_active}
                        onCheckedChange={() => handleToggleStatus(comment.id, comment.is_active)}
                        disabled={actionInProgress === comment.id}
                      />
                      <Label className="text-xs">
                        {comment.is_active ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                      disabled={actionInProgress === comment.id}
                    >
                      {actionInProgress === comment.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
