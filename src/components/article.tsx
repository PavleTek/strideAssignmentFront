import React, { useState } from 'react';
import { spacesApi } from '../services/spacesApi';
import { useAuth } from '../contexts/AuthContext';

export interface ArticleData {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  comments?: Array<{
    id: string;
    text: string;
    author: {
      id: string;
      username: string;
    };
    createdAt: string;
    replies?: Array<{
      id: string;
      text: string;
      author: {
        id: string;
        username: string;
      };
      createdAt: string;
    }>;
  }>;
  reactions?: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      username: string;
    };
  }>;
}

interface ArticleProps {
  article: ArticleData;
  onUpdate?: () => void; // Callback to refresh data
}

export const Article: React.FC<ArticleProps> = ({ article, onUpdate }) => {
  const { user } = useAuth();
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentReactionDropdown, setShowCommentReactionDropdown] = useState<string | null>(null);

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    } catch (error) {
      return 'recently';
    }
  };

  // Group reactions by emoji and count them
  const reactionCounts = article.reactions?.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Check if current user has already reacted
  const hasUserReacted = user && article.reactions?.some(reaction => reaction.user.id === user.id);

  // Count total comments (including replies)
  const totalComments = article.comments?.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0) || 0;

  const handleReactionClick = async (emoji: string) => {
    if (isLoading || hasUserReacted) return;
    
    setIsLoading(true);
    try {
      await spacesApi.createReaction({
        emoji,
        articleId: article.id,
      });
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
        await spacesApi.createComment({
          text: commentText,
          articleId: article.id,
        });
        setCommentText('');
        setShowCommentInput(false);
        onUpdate?.(); // Refresh data
      } catch (error) {
        console.error('Failed to add comment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleReplies = (commentId: string) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
    } else {
      newShowReplies.add(commentId);
    }
    setShowReplies(newShowReplies);
  };

  const toggleCommentReactionDropdown = (commentId: string) => {
    setShowCommentReactionDropdown(showCommentReactionDropdown === commentId ? null : commentId);
  };

  const handleCommentReactionClick = async (commentId: string, emoji: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await spacesApi.createReaction({
        emoji,
        commentId: commentId,
      });
      setShowCommentReactionDropdown(null);
      onUpdate?.(); // Refresh data
    } catch (error) {
      console.error('Failed to add comment reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-bottom border-gray-300 p-6 mb-4">
      {/* Header with user info and metadata */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium text-sm">
            {article.author.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">{article.author.username}</span>
          <span className="text-gray-500 text-sm">published Article</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{formatTimeAgo(article.createdAt)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{article.title}</h3>

      {/* Article text */}
      <p className="text-gray-600 leading-relaxed mb-4">
        {article.text.length > 300 
          ? `${article.text.substring(0, 300)}...` 
          : article.text
        }
      </p>

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
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Comment</span>
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
                  onClick={() => setShowCommentInput(false)}
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

      {/* Comments */}
      {article.comments && article.comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {article.comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-xs font-medium">
                    {comment.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{comment.author.username}</span>
                    <span className="text-gray-500 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                  
                  {/* Reply button */}
                  <button 
                    onClick={() => toggleReplies(comment.id)}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && showReplies.has(comment.id) && (
                <div className="ml-11 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-xs font-medium">
                          {reply.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{reply.author.username}</span>
                          <span className="text-gray-500 text-xs">{formatTimeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
