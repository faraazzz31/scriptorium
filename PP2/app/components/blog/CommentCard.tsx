import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown, AlertTriangle, MessageCircle } from 'lucide-react';
import type { Comment, User } from '@prisma/client';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

interface CommentWithRelations extends Comment {
  author: User;
  replies: CommentWithRelations[];
  upvotedBy: { id: number }[];
  downvotedBy: { id: number }[];
}

interface CommentCardProps {
  comment: CommentWithRelations;
  level?: number;
  onReport: (type: 'COMMENT', id: number) => void;
  onReply: (commentId: number) => void;
  selectedCommentId: number | null;
  onCancelReply: () => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitReply: (parentId: number) => Promise<void>;
  displayToast: (message: string, type: 'success' | 'error') => void;
}

const CommentCard: FC<CommentCardProps> = ({
  comment,
  level = 0,
  onReport,
  onReply,
  selectedCommentId,
  onCancelReply,
  newComment,
  onCommentChange,
  onSubmitReply,
  displayToast,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const initialVote = user ?
    (comment.upvotedBy?.some(voter => voter.id === user.id) ? 'UPVOTE' : 
    comment.downvotedBy?.some(voter => voter.id === user.id) ? 'DOWNVOTE' :
    null) :
  null;
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(initialVote);

  useEffect(() => {
    if (user) {
      setUserVote(
        comment.upvotedBy?.some(voter => voter.id === user.id) ? 'UPVOTE' : 
        comment.downvotedBy?.some(voter => voter.id === user.id) ? 'DOWNVOTE' : 
        null
      );
    } else {
      setUserVote(null);
    }
  }, [comment.id, comment.upvotedBy, comment.downvotedBy, user]);

  const HiddenLabel = () => (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Hidden
    </span>
  );

  const onVote = async (commentId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => {
    if (!user) return;

    try {
      const response = await fetch('/api/comment/change-vote', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ commentId, type, change }),
      });
      
      if (response.ok) {
        const updatedComment = await response.json();
        comment.upvotes = updatedComment.upvotes;
        comment.downvotes = updatedComment.downvotes;
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) {
      displayToast('Please log in to vote', 'error');
      return;
    }

    try {
      if (type === userVote) {
        // Remove vote if clicking on the same vote type
        await onVote(comment.id, type, -1);
        setUserVote(null);
      } else {
        // Remove previous vote if exists
        if (userVote) {
          await onVote(comment.id, userVote, -1);
        }
        // Add new vote
        await onVote(comment.id, type, 1);
        setUserVote(type);
      }
    } catch (error) {
      console.error(`[CommentCard.handleVote] Error: ${error}`);
    }
  };

  return (
    <div id={`comment-${comment.id}`} className={`${level > 0 ? 'ml-8' : ''}`}>
      <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-3 mb-2">
          {/* Avatar */}
          {comment.author.avatar ? (
            <Image
              src={comment.author.avatar.startsWith('/') ? comment.author.avatar : `/${comment.author.avatar}`}
              width={32}
              height={32}
              alt="Profile"
              className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all duration-200
                ${isDarkMode 
                  ? 'ring-blue-400/50 ring-offset-gray-900' 
                  : 'ring-gray-200 ring-offset-white'}`}
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
              ${isDarkMode 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-gray-200 ring-offset-2 ring-offset-white'}`}>
              {comment.author.firstName?.[0]}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">
              {comment.author.firstName || 'Anonymous'} {comment.author.lastName || ''}
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>
          {comment.isHidden && <HiddenLabel />}  {/* This will show the label for both admin and author */}
        </div>
        <p className={`mb-3 break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {comment.content}
        </p>
        
        <div className="flex items-center space-x-6">
          {/* Vote buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('UPVOTE')}
                className={`p-1 rounded ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowBigUp
                  className={`w-5 h-5 ${
                    userVote === 'UPVOTE' ? 'text-green-500' : ''
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {comment.upvotes}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('DOWNVOTE')}
                className={`p-1 rounded ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowBigDown
                  className={`w-5 h-5 ${
                    userVote === 'DOWNVOTE' ? 'text-red-500' : ''
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {comment.downvotes}
              </span>
            </div>
          </div>

          {/* Reply button */}
          <button
            onClick={() => onReply(comment.id)}
            className={`flex items-center space-x-1 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Reply</span>
          </button>

          {/* Report button */}
          <button
            onClick={() => onReport('COMMENT', comment.id)}
            className={`flex items-center space-x-1 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Report</span>
          </button>
        </div>

        {/* Reply input field */}
        {selectedCommentId === comment.id && (
          <div className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Write a reply..."
              className={`w-full p-2 rounded ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'border border-gray-300'
              }`}
              rows={3}
            />
            <div className="mt-2 space-x-2">
              <button
                onClick={() => onSubmitReply(comment.id)}
                className={`px-3 py-1 rounded text-white ${
                  isDarkMode
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                Reply
              </button>
              <button
                onClick={onCancelReply}
                className="px-3 py-1 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Render replies recursively */}
        {comment.replies.length > 0 && (
          <div className="mt-4 -mb-4">
            {comment.replies.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                level={level + 1}
                onReport={onReport}
                onReply={onReply}
                selectedCommentId={selectedCommentId}
                onCancelReply={onCancelReply}
                newComment={newComment}
                onCommentChange={onCommentChange}
                onSubmitReply={onSubmitReply}
                displayToast={displayToast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;