import { FC, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import type { Comment, User } from '@prisma/client';
import { useTheme } from '../theme/ThemeContext';
import CommentCard from './CommentCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReportModal from './ReportModal';

interface CommentWithRelations extends Comment {
  author: User;
  replies: CommentWithRelations[];
  upvotedBy: { id: number }[];
  downvotedBy: { id: number }[];
}

interface CommentSectionProps {
  postId: number;
}

interface PaginationButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const CommentSection: FC<CommentSectionProps> = ({ postId }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<'Most valued' | 'Most controversial' | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newCommentId, setNewCommentId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Comments per page

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/comment/fetch-all?blogPostId=${postId}&sorting=${sorting}&page=${currentPage}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include',
        }
      );
      const data = await response.json();
      setComments(data.data); // The backend now returns already organized comments
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, sorting, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sorting]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PaginationButton: React.FC<PaginationButtonProps> = ({ isActive, onClick, disabled = false, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${isActive
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
    >
        {children}
    </button>
  );

  const renderPagination = () => {
    // Don't show pagination if there's only one page or no items
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
        if (currentPage <= 3) {
            // Show first 3 pages + ellipsis + last page
            for (let i = 1; i <= Math.min(3, totalPages); i++) {
                pages.push(i);
            }
            if (totalPages > 4) {
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        } else if (currentPage >= totalPages - 2) {
            // Show first page + ellipsis + last 3 pages
            pages.push(1);
            if (totalPages > 4) {
                pages.push('ellipsis');
            }
            for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page + ellipsis + current and adjacent pages + ellipsis + last page
            pages.push(1);
            pages.push('ellipsis');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            if (currentPage + 2 < totalPages) {
                pages.push('ellipsis');
            }
            pages.push(totalPages);
        }
    } else {
        // Show all pages if there are 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <PaginationButton
                isActive={false}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="w-4 h-4" />
            </PaginationButton>

            {pages.map((page, index) => (
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-4 py-2">...</span>
                ) : (
                    <PaginationButton
                        key={page}
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(Number(page))}
                    >
                        {page}
                    </PaginationButton>
                )
            ))}

            <PaginationButton
                isActive={false}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="w-4 h-4" />
            </PaginationButton>
        </div>
    );
  };

  const renderPageInfo = () => {
    if (totalCount === 0) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalCount);

    return (
      <div className={`text-sm text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {startItem}-{endItem} of {totalCount} comments
      </div>
    );
  };

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
        const newCommentData = await response.json();
        setNewComment('');
        setSelectedCommentId(null);
        await fetchComments();
        setNewCommentId(newCommentData.id); // Set the new comment ID
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReport = (type: 'BLOG_POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  }

  useEffect(() => {
    if (newCommentId) {
      const commentElement = document.getElementById(`comment-${newCommentId}`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setNewCommentId(null); // Reset for future comments
      }
    }
  }, [comments, newCommentId]); // Depend on comments array to ensure rendering is complete

  return (
    <div className="mt-6">
      {/* New comment input */}
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

      {/* Comments sorting dropdown */}
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

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments?.map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onReport={handleReport}
                onReply={(commentId) => setSelectedCommentId(commentId)}
                selectedCommentId={selectedCommentId}
                onCancelReply={() => {
                  setSelectedCommentId(null);
                  setNewComment('');
                }}
                newComment={newComment}
                onCommentChange={(value) => setNewComment(value)}
                onSubmitReply={handleSubmitComment}
              />
            ))}
          </div>
          {renderPagination()}
          {renderPageInfo()}
        </>
      )}

      {/* Report modal */}
      {showReportModal && reportTarget && (
        <ReportModal
          type={reportTarget.type}
          contentId={reportTarget.id}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default CommentSection;