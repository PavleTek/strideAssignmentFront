import React, { useState } from 'react';
import { Comment as CommentType, Reaction } from './commentAndReaction';
import { CommentAndReaction } from './commentAndReaction';

interface CommentProps {
  comments: CommentType[];
  onUpdate?: () => void;
  level?: number;
}

export const Comment: React.FC<CommentProps> = ({ comments, onUpdate, level = 1 }) => {
  const [showCommentInputs, setShowCommentInputs] = useState<Set<string>>(new Set());

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

  const toggleCommentInput = (commentId: string) => {
    const newShowCommentInputs = new Set(showCommentInputs);
    if (newShowCommentInputs.has(commentId)) {
      newShowCommentInputs.delete(commentId);
    } else {
      newShowCommentInputs.add(commentId);
    }
    setShowCommentInputs(newShowCommentInputs);
  };

  const getAvatarSize = (level: number) => {
    if (level === 1) return 'w-8 h-8';
    if (level === 2) return 'w-6 h-6';
    return 'w-5 h-5';
  };

  const getIndentation = (level: number) => {
    if (level === 1) return '';
    if (level === 2) return 'ml-11';
    if (level === 3) return 'ml-16';
    return 'ml-20';
  };

  if (!comments || comments.length === 0) {
    return null;
  }

           return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        {comments.map((comment) => (
                     <div key={comment.id} className={`space-y-2 ${getIndentation(level)}`}>
           <div className="flex gap-3">
            <div className={`${getAvatarSize(level)} bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className={`text-gray-600 ${level === 1 ? 'text-xs' : 'text-xs'} font-medium`}>
                {comment.author.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">{comment.author.username}</span>
                <span className="text-gray-500 text-xs">{formatTimeAgo(comment.createdAt)}</span>
              </div>
                             <p className="text-gray-700 text-sm">{comment.text}</p>
            </div>
          </div>

                     {/* Comment reactions and input for this comment */}
           {comment.level < 4 && (
             <div>
               <CommentAndReaction
                 contentId={comment.id}
                 contentType="comment"
                 reactions={comment.reactions || []}
                 comments={comment.replies || []}
                 onUpdate={onUpdate}
                 showCommentInput={showCommentInputs.has(comment.id)}
                 onToggleCommentInput={() => toggleCommentInput(comment.id)}
               />
               
                            </div>
           )}

           {/* Recursively render replies */}
           {comment.replies && comment.replies.length > 0 && level < 4 && (
             <Comment
               comments={comment.replies}
               onUpdate={onUpdate}
               level={level + 1}
             />
           )}
        </div>
      ))}
    </div>
  );
};
