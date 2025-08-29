import React, { useState } from 'react';
import { spacesApi } from '../services/spacesApi';
import { useAuth } from '../contexts/AuthContext';

export interface Reaction {
  id: string;
  emoji: string;
  user: {
    id: string;
    username: string;
  };
}

export interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  level: number;
  replies?: Comment[];
  reactions?: Reaction[];
}

interface CommentAndReactionProps {
  contentId: string;
  contentType: 'flashcard' | 'article' | 'alert' | 'comment';
  reactions?: Reaction[];
  comments?: Comment[];
  onUpdate?: () => void;
  showCommentInput?: boolean;
  onToggleCommentInput?: () => void;
}

export const CommentAndReaction: React.FC<CommentAndReactionProps> = ({
  contentId,
  contentType,
  reactions = [],
  comments = [],
  onUpdate,
  showCommentInput = false,
  onToggleCommentInput
}) => {
  const { user } = useAuth();
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Group reactions by emoji and count them
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check if current user has already reacted
  const hasUserReacted = user && reactions.some(reaction => reaction.user.id === user.id);

  // Count total comments (including replies)
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  const handleReactionClick = async (emoji: string) => {
    if (isLoading || hasUserReacted) return;
    
    setIsLoading(true);
    try {
      const reactionData: {
        emoji: string;
        flashcardId?: string;
        articleId?: string;
        alertId?: string;
        commentId?: string;
      } = { emoji };
      
      switch (contentType) {
        case 'flashcard':
          reactionData.flashcardId = contentId;
          break;
        case 'article':
          reactionData.articleId = contentId;
          break;
        case 'alert':
          reactionData.alertId = contentId;
          break;
        case 'comment':
          reactionData.commentId = contentId;
          break;
      }

      await spacesApi.createReaction(reactionData);
      setShowReactionDropdown(false);
      onUpdate?.(); // Refresh data
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (commentText.trim() && !isLoading) {
      setIsLoading(true);
      try {
        const commentData: {
          text: string;
          flashcardId?: string;
          articleId?: string;
          parentId?: string;
          contentType?: string;
        } = { text: commentText };
        
        switch (contentType) {
          case 'flashcard':
            commentData.flashcardId = contentId;
            commentData.contentType = 'flashcard';
            break;
          case 'article':
            commentData.articleId = contentId;
            commentData.contentType = 'article';
            break;
          case 'alert':
            commentData.articleId = contentId; // Alerts use articleId for comments
            commentData.contentType = 'alert';
            break;
          case 'comment':
            commentData.parentId = contentId;
            commentData.contentType = 'comment';
            // The backend will get the articleId/flashcardId from the parent comment
            break;
        }

        await spacesApi.createComment(commentData);
        setCommentText('');
        onToggleCommentInput?.(); // Close comment input
        onUpdate?.(); // Refresh data
      } catch (error) {
        console.error('Failed to add comment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {/* Footer with reactions and comments */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Left side - Reactions */}
        <div className="flex items-center gap-2">
          {/* Reaction chips */}
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <span key={emoji} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              <span>{emoji}</span>
              <span className="font-medium">{count}</span>
            </span>
          ))}
          
          {/* Add reaction button */}
          <div className="relative">
            {!hasUserReacted && (
              <>
                <button 
                  onClick={() => setShowReactionDropdown(!showReactionDropdown)}
                  disabled={isLoading}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <span className="text-gray-600 text-sm">+</span>
                </button>
                
                {/* Reaction dropdown */}
                {showReactionDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReactionClick('🔥')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-lg"
                      >
                        🔥
                      </button>
                      <button 
                        onClick={() => handleReactionClick('🎉')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-lg"
                      >
                        🎉
                      </button>
                      <button 
                        onClick={() => handleReactionClick('🤘')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-lg"
                      >
                        🤘
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side - Comments */}
        <div className="flex items-center gap-2">
          {totalComments > 0 && (
            <span className="text-gray-500 text-sm">{totalComments} comment{totalComments !== 1 ? 's' : ''}</span>
          )}
          <button 
            onClick={onToggleCommentInput}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{contentType === 'comment' ? 'Reply' : 'Comment'}</span>
          </button>
        </div>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-xs font-medium">U</span>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={onToggleCommentInput}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isLoading}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
