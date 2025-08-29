import React, { useState } from 'react';
import { spacesApi } from '../services/spacesApi';
import { useAuth } from '../contexts/AuthContext';
import { CommentAndReaction } from './commentAndReaction';
import { Comment } from './comment';

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
    level: number;
    replies?: Array<{
      id: string;
      text: string;
      author: {
        id: string;
        username: string;
      };
      createdAt: string;
      level: number;
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
    } catch (error) {
      return 'recently';
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

      {/* Comment and Reaction Section */}
      <CommentAndReaction
        contentId={article.id}
        contentType="article"
        reactions={article.reactions || []}
        comments={article.comments || []}
        onUpdate={onUpdate}
        showCommentInput={showCommentInput}
        onToggleCommentInput={() => setShowCommentInput(!showCommentInput)}
      />

      {/* Comments */}
      {article.comments && article.comments.length > 0 && (
        <Comment
          comments={article.comments}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};
