import React, { useState } from 'react';
import { CommentAndReaction } from './commentAndReaction';
import { Comment } from './comment';

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
  const [showCommentInput, setShowCommentInput] = useState(false);

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
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="border-bottom border-gray-300 p-6 mb-4">
      <div className="flex flex-col lg:flex-row gap-6">
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

        {/* Right side card with short description - moves below on mobile */}
        <div className="w-full lg:w-64 lg:flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden">
            <p className="text-gray-700 text-sm leading-relaxed text-center p-4">{flashcard.shortDescription}</p>
            <div className="h-7 bg-[#423cb9] rounded-b-lg"></div>
          </div>
        </div>
      </div>

      {/* Comment and Reaction Section */}
      <CommentAndReaction
        contentId={flashcard.id}
        contentType="flashcard"
        reactions={flashcard.reactions || []}
        comments={flashcard.comments || []}
        onUpdate={onUpdate}
        showCommentInput={showCommentInput}
        onToggleCommentInput={() => setShowCommentInput(!showCommentInput)}
      />

      {/* Comments */}
      {flashcard.comments && flashcard.comments.length > 0 && (
        <Comment
          comments={flashcard.comments}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};
