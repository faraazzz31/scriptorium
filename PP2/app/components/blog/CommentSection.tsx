// app/components/blog/CommentSection.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import type { Comment, User } from '@prisma/client';
import { useTheme } from '../theme/ThemeContext';

interface CommentWithRelations extends Comment {
  author: User;
  replies: CommentWithRelations[];
}

interface CommentSectionProps {
  postId: number;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<'Most valued' | 'Most controversial' | null>(null);
  const [newComment, setNewComment] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null); // For replying to comments
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const organizeComments = useCallback((flatComments: (Comment & { author: User })[]): CommentWithRelations[] => {
    const commentMap = new Map<number, CommentWithRelations>();
    const topLevelComments: CommentWithRelations[] = [];

    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    flatComments.forEach(comment => {
      if (comment.parentId === null) {
        topLevelComments.push(commentMap.get(comment.id)!);
      } else {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentMap.get(comment.id)!);
        }
      }
    });

    return topLevelComments;
  }, []); // No dependencies needed for this function

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/comment/fetch-all?blogPostId=${postId}&sorting=${sorting}`
      );
      const data = await response.json();
      const organizedComments = organizeComments(data.data);
      setComments(organizedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, sorting, organizeComments]); // Include all dependencies

  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // Now fetchComments is stable and can be included

  const handleSubmitComment = async (parentId?: number) => {
    if (!user || !newComment.trim()) return;

    try {
      const response = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          toBlogPost: !parentId,
          content: newComment,
          blogPostId: postId,
          parentCommentId: parentId
        }),
      });

      if (response.ok) {
        setNewComment('');
        setSelectedCommentId(null);
        fetchComments(); // Refresh comments to show the new one
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const renderComment = (comment: CommentWithRelations, level = 0) => {
    if (comment.isHidden) {
      return (
        <div key={comment.id} className={`mt-4 ${level > 0 ? 'ml-8' : ''}`}>
          <p className="text-gray-500 italic">This comment has been hidden by a moderator.</p>
        </div>
      );
    }

    return (
      <div key={comment.id} className={`mt-4 ${level > 0 ? 'ml-8' : ''}`}>
        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium">
              {comment.author.firstName || 'Anonymous'} {comment.author.lastName || ''}
            </span>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              • {formatDistanceToNow(comment.createdAt)} ago
            </span>
          </div>
          
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ArrowBigUp className="w-4 h-4" />
              </button>
              <span>{comment.upvotes - comment.downvotes}</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ArrowBigDown className="w-4 h-4" />
              </button>
            </div>
            
            {user && (
              <button 
                onClick={() => setSelectedCommentId(selectedCommentId === comment.id ? null : comment.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply input field */}
          {selectedCommentId === comment.id && (
            <div className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded"
                rows={3}
              />
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleSubmitComment(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setSelectedCommentId(null);
                    setNewComment('');
                  }}
                  className="px-3 py-1 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {comment.replies.map(reply => renderComment(reply, level + 1))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Comments</h3>
        <select
          value={sorting || ''}
          onChange={(e) => setSorting(e.target.value as typeof sorting)}
          className={`rounded-md px-3 py-2 border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="">Latest</option>
          <option value="Most valued">Most Valued</option>
          <option value="Most controversial">Most Controversial</option>
        </select>
      </div>

      {user && (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className={`w-full p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-300'
            }`}
            rows={3}
          />
          <button
            onClick={() => handleSubmitComment()}
            className={`mt-2 px-4 py-2 rounded-lg text-white ${
              isDarkMode
                ? 'bg-teal-600 hover:bg-teal-700'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            Comment
          </button>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;