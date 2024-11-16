import { FC } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown, Share2, AlertTriangle } from 'lucide-react';
import { BlogPostWithRelations } from '@/app/blog/page';
import { useTheme } from '@/app/components/theme/ThemeContext';

interface BlogPostCardProps {
  post: BlogPostWithRelations;
  viewMode: 'compact' | 'card';
  onVote: (postId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => void;
  onShare: (postId: number) => void;
  onReport: (type: 'BLOG_POST' | 'COMMENT', id: number) => void;
  onSelect?: () => void;
  expanded?: boolean;
}

const BlogPostCard: FC<BlogPostCardProps> = ({
  post,
  viewMode,
  onVote,
  onShare,
  onReport,
  onSelect,
  expanded = false,
}) => {
  const { isDarkMode } = useTheme();
  const isCompact = viewMode === 'compact';
  const descriptionLimit = expanded ? Infinity : 200;

  return (
    <div
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm ${
        isCompact ? 'p-3' : 'p-6'
      }`}
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
          <div className="flex space-x-4">
            {post.codeTemplates.map(template => (
              <div
                key={template.id}
                className={`flex-none w-72 p-4 border rounded ${
                  isDarkMode 
                    ? 'border-gray-700' 
                    : 'border-gray-200'
                }`}
              >
                <h3 className="font-semibold mb-1">{template.title}</h3>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  by {template.author.firstName} {template.author.lastName}
                </p>
                <span className={`inline-block px-2 py-1 text-sm rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {template.language}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(post.id, 'UPVOTE', 1);
            }}
            className={`p-1 rounded ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowBigUp className="w-5 h-5" />
          </button>
          <span>{post.upvotes - post.downvotes}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(post.id, 'DOWNVOTE', 1);
            }}
            className={`p-1 rounded ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowBigDown className="w-5 h-5" />
          </button>
        </div>
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