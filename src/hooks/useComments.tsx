
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Comment } from '@/components/comments/CommentMonitor';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/twitter/get-comments', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(async (commentText: string) => {
    try {
      const response = await fetch('http://localhost:3000/twitter/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ comment_text: commentText })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const data = await response.json();
      setComments(prev => [...prev, data.data]);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/twitter/delete-comment/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }, []);

  const toggleCommentStatus = useCallback(async (commentId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/twitter/update-comment-status/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update comment status');
      }
      
      const data = await response.json();
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, is_active: isActive } 
            : comment
        )
      );
      
      toast.success(`Comment ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  }, []);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    toggleCommentStatus,
    refreshComments: fetchComments
  };
}
