import React, { useState } from 'react';
import { spacesApi } from '../services/spacesApi';
import { useAuth } from '../contexts/AuthContext';

export interface FlashcardData {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
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
        level: number;
        author: {
          id: string;
          username: string;
        };
        createdAt: string;
        reactions?: Array<{
          id: string;
          emoji: string;
          user: {
            id: string;
            username: string;
          };
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
    level: number; // Added for comment level
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

interface FlashcardProps {
  flashcard: FlashcardData;
  onUpdate?: () => void; // Callback to refresh data
}

export const Flashcard: React.FC<FlashcardProps> = ({ flashcard, onUpdate }) => {
  const { user } = useAuth();
  const [showReactionDropdown, setShowReactionDropdown] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

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
  const reactionCounts =
    flashcard.reactions?.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  // Check if current user has already reacted
  const hasUserReacted = user && flashcard.reactions?.some(reaction => reaction.user.id === user.id);

  // Count total comments (including replies)
  const totalComments = flashcard.comments?.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0) || 0;

  const handleReactionClick = async (emoji: string) => {
    if (isLoading || hasUserReacted) return;
    
    setIsLoading(true);
    try {
      await spacesApi.createReaction({
        emoji,
        flashcardId: flashcard.id,
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
          flashcardId: flashcard.id,
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

  // New state for comment reactions dropdown
  const [showCommentReactionDropdown, setShowCommentReactionDropdown] = useState<string | null>(null);

  const toggleCommentReactionDropdown = (commentId: string) => {
    setShowCommentReactionDropdown(commentId);
  };

  const handleCommentReactionClick = async (commentId: string, emoji: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await spacesApi.createReaction({
        emoji,
        commentId,
      });
      setShowCommentReactionDropdown(null); // Close dropdown
      onUpdate?.(); // Refresh data
    } catch (error) {
      console.error('Failed to add comment reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-bottom border-gray-300 p-6 mb-4">
      <div className="flex gap-6">
        {/* Main content area */}
        <div className="flex-1">
          {/* Header with user info and metadata */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">{flashcard.author.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 pr-2">{flashcard.author.username}</span>
              <span className="text-gray-500 text-sm pr-2">published Flashcard</span>
              <span className="text-gray-400 pr-2">•</span>
              <span className="text-gray-500 text-sm pr-2">{formatTimeAgo(flashcard.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{flashcard.title}</h3>

          {/* Long description */}
          <p className="text-gray-600 leading-relaxed mb-4">
            {flashcard.longDescription.length > 200 ? `${flashcard.longDescription.substring(0, 200)}...` : flashcard.longDescription}
          </p>
        </div>

        {/* Right side card with short description */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden">
            <p className="text-gray-700 text-sm leading-relaxed text-center p-4">{flashcard.shortDescription}</p>
            <div className="h-7 bg-[#423cb9] rounded-b-lg"></div>
          </div>
        </div>
      </div>

      {/* Footer with reactions and comments */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
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
      {flashcard.comments && flashcard.comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {flashcard.comments.map((comment) => (
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
                  
                  {/* Comment reactions and actions bar */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    {/* Left side - Reactions */}
                    <div className="flex items-center gap-2">
                      {/* Reaction chips */}
                      {comment.reactions && comment.reactions.length > 0 && (
                        <>
                          {Object.entries(
                            comment.reactions.reduce((acc, reaction) => {
                              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([emoji, count]) => (
                            <span key={emoji} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              <span>{emoji}</span>
                              <span className="font-medium">{count}</span>
                            </span>
                          ))}
                        </>
                      )}
                      
                      {/* Add reaction button - only show if comment level < 4 */}
                      {comment.level < 4 && (
                        <div className="relative">
                          {!comment.reactions?.some(reaction => reaction.user.id === user?.id) && (
                            <>
                              <button 
                                onClick={() => toggleCommentReactionDropdown(comment.id)}
                                disabled={isLoading}
                                className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 text-xs"
                              >
                                <span className="text-gray-600">+</span>
                              </button>
                              
                              {/* Reaction dropdown */}
                              {showCommentReactionDropdown === comment.id && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleCommentReactionClick(comment.id, '🔥')}
                                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                    >
                                      🔥
                                    </button>
                                    <button 
                                      onClick={() => handleCommentReactionClick(comment.id, '🎉')}
                                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                    >
                                      🎉
                                    </button>
                                    <button 
                                      onClick={() => handleCommentReactionClick(comment.id, '🤘')}
                                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                    >
                                      🤘
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right side - Reply button - only show if comment level < 4 */}
                    {comment.level < 4 && (
                      <button 
                        onClick={() => toggleReplies(comment.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Reply
                      </button>
                    )}
                  </div>
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
                        
                        {/* Reply reactions and actions bar */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                          {/* Left side - Reactions */}
                          <div className="flex items-center gap-2">
                            {/* Reaction chips */}
                            {reply.reactions && reply.reactions.length > 0 && (
                              <>
                                {Object.entries(
                                  reply.reactions.reduce((acc, reaction) => {
                                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                    return acc;
                                  }, {} as Record<string, number>)
                                ).map(([emoji, count]) => (
                                  <span key={emoji} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    <span>{emoji}</span>
                                    <span className="font-medium">{count}</span>
                                  </span>
                                ))}
                              </>
                            )}
                            
                            {/* Add reaction button - only show if reply level < 4 */}
                            {reply.level < 4 && (
                              <div className="relative">
                                {!reply.reactions?.some(reaction => reaction.user.id === user?.id) && (
                                  <>
                                    <button 
                                      onClick={() => toggleCommentReactionDropdown(reply.id)}
                                      disabled={isLoading}
                                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 text-xs"
                                    >
                                      <span className="text-gray-600">+</span>
                                    </button>
                                    
                                    {/* Reaction dropdown */}
                                    {showCommentReactionDropdown === reply.id && (
                                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-10">
                                        <div className="flex gap-1">
                                          <button 
                                            onClick={() => handleCommentReactionClick(reply.id, '🔥')}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                          >
                                            🔥
                                          </button>
                                          <button 
                                            onClick={() => handleCommentReactionClick(reply.id, '🎉')}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                          >
                                            🎉
                                          </button>
                                          <button 
                                            onClick={() => handleCommentReactionClick(reply.id, '🤘')}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-sm"
                                          >
                                            🤘
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right side - Reply button - only show if reply level < 4 */}
                          {reply.level < 4 && (
                            <button 
                              onClick={() => toggleReplies(reply.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Reply
                            </button>
                          )}
                        </div>
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
