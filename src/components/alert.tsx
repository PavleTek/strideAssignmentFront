import React, { useState } from 'react';
import { CommentAndReaction } from './commentAndReaction';
import { Comment } from './comment';
import { AlertData as ApiAlertData } from '../services/spacesApi';

// Use the API's AlertData type
export type AlertData = ApiAlertData;

interface AlertProps {
  alert: AlertData;
  onUpdate?: () => void; // Callback to refresh data
}

export const Alert: React.FC<AlertProps> = ({ alert, onUpdate }) => {
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
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎉</span>
          <span className="font-semibold text-gray-900">Newbie alert</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{formatTimeAgo(alert.createdAt)}</span>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">{alert.author?.username.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1">
            <div className="text-gray-900 font-semibold">{alert.author?.username || 'User'}</div>
            <div className="text-gray-600 text-sm">
              joined <span className="font-semibold">{alert.space?.name}</span>
            </div>
            <div className="text-gray-700 mt-1">Take a second to say hello...</div>
          </div>
        </div>

        {/* Comment and Reaction Section */}
        <CommentAndReaction
          contentId={alert.id}
          contentType="alert"
          reactions={alert.reactions || []}
          comments={alert.comments || []}
          onUpdate={onUpdate}
          showCommentInput={showCommentInput}
          onToggleCommentInput={() => setShowCommentInput(!showCommentInput)}
        />

        {/* Comments */}
        {alert.comments && alert.comments.length > 0 && <Comment comments={alert.comments} onUpdate={onUpdate} />}
      </div>
    </div>
  );
};
