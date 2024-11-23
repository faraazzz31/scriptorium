import { FC, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown, Share2, AlertTriangle, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { BlogPostWithRelations } from '@/app/blog/page';
import { useTheme } from '@/app/components/theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

interface BlogPostCardProps {
  post: BlogPostWithRelations;
  onShare: (postId: number) => void;
  onReport: (type: 'BLOG_POST' | 'COMMENT', id: number) => void;
  onSelect?: () => void;
  expanded?: boolean;
  onEdit?: (post: BlogPostWithRelations) => void;
  onDelete?: (postId: number) => void;
  showEditDelete?: boolean;
  displayToast: (message: string, type: 'success' | 'error') => void;
}

const BlogPostCard: FC<BlogPostCardProps> = ({
  post,
  onShare,
  onReport,
  onSelect,
  expanded = false,
  onEdit,
  onDelete,
  showEditDelete = false,
  displayToast,
}) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const descriptionLimit = expanded ? Infinity : 200;
  // Check if the current user has voted on this post
  const initialVote = user ?
    (post.upvotedBy?.some(voter => voter.id === user.id) ? 'UPVOTE' : 
    post.downvotedBy?.some(voter => voter.id === user.id) ? 'DOWNVOTE' :
    null) :
  null;
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(initialVote);

  useEffect(() => {
    if (user) {
      setUserVote(
        post.upvotedBy?.some(voter => voter.id === user.id) ? 'UPVOTE' : 
        post.downvotedBy?.some(voter => voter.id === user.id) ? 'DOWNVOTE' : 
        null
      );
    } else {
      setUserVote(null);
    }
  }, [post.id, post.upvotedBy, post.downvotedBy, user]);

  const onVote = async (postId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/blog-post/change-vote', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ blogPostId: postId, type, change }),
      });
      
      if (response.ok) {
        const updatedPost = await response.json();
        post.upvotes = updatedPost.upvotes;
        post.downvotes = updatedPost.downvotes;
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleVote = (type: 'UPVOTE' | 'DOWNVOTE') => async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      displayToast('Please log in to vote', 'error');
      return;
    }

    try {
      if (type === userVote) {
        // Remove vote if clicking on the same vote type
        await onVote(post.id, type, -1);
        setUserVote(null);
      } else {
        // Remove previous vote if exists
        if (userVote) {
          await onVote(post.id, userVote, -1);
        }
        // Add new vote
        await onVote(post.id, type, 1);
        setUserVote(type);
      }
    } catch (error) {
      console.error(`[BlogPostCard.handleVote] Error: ${error}`);
    }
  }

  return (
    <div
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        rounded-lg shadow-sm
        p-6
        cursor-pointer
        hover:shadow-lg
        hover:scale-[1.01]
        transition-all
        duration-200`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {post.author.firstName} {post.author.lastName}
        </span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          • {formatDistanceToNow(post.createdAt)} ago
        </span>
        {/* Show hidden tag if post is hidden */}
        {post.isHidden && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Hidden
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map(tag => (
          <span
            key={tag.id}
            className={`px-2 py-1 ${
              isDarkMode 
                ? 'bg-blue-900 text-blue-100' 
                : 'bg-blue-100 text-blue-800'
            } text-sm rounded`}
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
        {post.description.length > descriptionLimit && !expanded
          ? `${post.description.slice(0, descriptionLimit)}...`
          : post.description}
      </p>

      {/* Code Templates */}
      {post.codeTemplates.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <div className="flex space-x-4 pb-2"> {/* Added pb-2 to ensure hover shadow is visible */}
            {post.codeTemplates.map(template => (
              <div
                key={template.id}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/code-template/${template.id}`;
                }}
                className={`flex-none w-72 p-4 border rounded cursor-pointer 
                  transition-colors duration-200
                  ${isDarkMode 
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-blue-500' 
                    : 'border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300'
                  }`}
              >
                <h3 className={`font-semibold mb-1 transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-100 group-hover:text-white' 
                    : 'text-gray-900 group-hover:text-blue-800'
                }`}>
                  {template.title}
                </h3>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  by {template.author.firstName} {template.author.lastName}
                </p>
                <span className={`inline-block px-2 py-1 text-sm rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {template.language}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6">
        {/* Vote buttons */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handleVote('UPVOTE')}
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
              {post.upvotes}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleVote('DOWNVOTE')}
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
              {post.downvotes}
            </span>
          </div>
        </div>
        {/* Comment button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className={`flex items-center space-x-1 ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post._count?.comments || 0}</span>
        </button>
        {/* Share button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(post.id);
          }}
          className={`flex items-center space-x-1 ${
            isDarkMode 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>

        {/* Only show edit/delete buttons if user owns the post */}
        {showEditDelete && user?.id === post.author.id && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(post);
              }}
              className={`flex items-center space-x-1 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pencil className="w-5 h-5" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(post.id);
              }}
              className={`flex items-center space-x-1 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReport('BLOG_POST', post.id);
          }}
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
    </div>
  );
};

export default BlogPostCard;