import { FC, useState, useEffect } from 'react';
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
  onVote: (commentId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => Promise<void>;
  onReport: (type: 'COMMENT', id: number) => void;
  onReply: (commentId: number) => void;
  selectedCommentId: number | null;
  onCancelReply: () => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitReply: (parentId: number) => Promise<void>;
}

const CommentCard: FC<CommentCardProps> = ({
  comment,
  level = 0,
  onVote,
  onReport,
  onReply,
  selectedCommentId,
  onCancelReply,
  newComment,
  onCommentChange,
  onSubmitReply,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null);

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

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) return;

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

  if (comment.isHidden) {
    return (
      <div className={`mt-4 ${level > 0 ? 'ml-8' : ''}`}>
        <p className="text-gray-500 italic">This comment has been hidden by a moderator.</p>
      </div>
    );
  }

  return (
    <div id={`comment-${comment.id}`} className={`${level > 0 ? 'ml-8' : ''}`}>
      <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium">
            {comment.author.firstName || 'Anonymous'} {comment.author.lastName || ''}
          </span>
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            • {formatDistanceToNow(new Date(comment.createdAt))} ago
          </span>
        </div>
        
        <p className={`mb-3 break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {comment.content}
        </p>
        
        <div className="flex items-center space-x-4">
          {/* Vote buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowBigUp className={`w-5 h-5 ${userVote === 'UPVOTE' ? 'text-green-500' : ''}`} />
            </button>
            <span>{comment.upvotes - comment.downvotes}</span>
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowBigDown className={`w-5 h-5 ${userVote === 'DOWNVOTE' ? 'text-red-500' : ''}`} />
            </button>
          </div>

          {/* Reply button */}
          {user && (
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
          )}

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
                onVote={onVote}
                onReport={onReport}
                onReply={onReply}
                selectedCommentId={selectedCommentId}
                onCancelReply={onCancelReply}
                newComment={newComment}
                onCommentChange={onCommentChange}
                onSubmitReply={onSubmitReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;