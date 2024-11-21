'use client';

import { useState, useEffect, useCallback } from 'react';
import BlogPostCard from '@/app/components/blog/BlogPostCard';
import ReportModal from '@/app/components/blog/ReportModal';
import { BlogPost, User, Tag, CodeTemplate } from '@prisma/client';
import Navbar from '../components/Navbar';
import Toast from '../components/ui/Toast';
import { useTheme } from '../components/theme/ThemeContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BlogPostWithRelations extends BlogPost {
  author: User;
  tags: Tag[];
  codeTemplates: (CodeTemplate & {
    author: User;
  })[];
  upvotedBy: { id: number }[];
  downvotedBy: { id: number }[];
  _count: {
    comments: number;
  };
}

interface FetchBlogPostsResponse {
  data: BlogPostWithRelations[];
  totalPages: number;
  totalCount: number;
  sorting: string | null;
}

interface PaginationButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Number of posts per page
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'card'>('card');
  const [sorting, setSorting] = useState<'Most valued' | 'Most controversial' | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const fetchPosts = useCallback(async () => {    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/blog-post/fetch-all?page=${currentPage}&limit=${limit}${sorting ? `&sorting=${sorting}` : ''}`
      );
      const data: FetchBlogPostsResponse = await response.json();
      
      setPosts(data.data);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sorting]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sorting]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
    console.log(`[renderPagination] currentPage: ${currentPage}, totalPages: ${totalPages}`);
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > 4) {
          pages.push('ellipsis');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) {
          pages.push('ellipsis');
        }
        for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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

    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalCount);

    return (
      <div className={`text-sm text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {startItem}-{endItem} of {totalCount} posts
      </div>
    );
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/blog/${postId}`;
    navigator.clipboard.writeText(url);
    setShowToast(true);
  };

  const handleReport = (type: 'BLOG_POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <div className="container mx-auto p-4">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <select
              value={sorting || ''}
              onChange={(e) => setSorting(e.target.value as typeof sorting)}
              className={`p-2 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300'
              }`}
            >
              <option value="">Latest</option>
              <option value="Most valued">Most Valued</option>
              <option value="Most controversial">Most Controversial</option>
            </select>
            <button
              onClick={() => setViewMode(prev => prev === 'card' ? 'compact' : 'card')}
              className={`p-2 rounded font-semibold ${
                isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {viewMode === 'card' ? 'Compact View' : 'Card View'}
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-white' : 'border-gray-900'
              }`} />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-4">
                {posts.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    viewMode={viewMode}
                    onShare={handleShare}
                    onReport={handleReport}
                    onSelect={() => router.push(`/blog/${post.id}`)}
                  />
                ))}
              </div>
              {renderPagination()}
              {renderPageInfo()}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No posts found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
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

      {/* Toast */}
      {showToast && (
        <Toast
          message="Link copied to clipboard!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
