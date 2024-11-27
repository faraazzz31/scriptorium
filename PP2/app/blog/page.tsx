'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import BlogPostCard from '@/app/components/blog/BlogPostCard';
import ReportModal from '@/app/components/blog/ReportModal';
import { BlogPost, User, Tag, CodeTemplate } from '@prisma/client';
import Navbar from '../components/Navbar';
import Toast from '../components/ui/Toast';
import { useTheme } from '../components/theme/ThemeContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import BlogPostModal from '../components/blog/BlogPostModal';
import { Search, Tag as LucideTag } from 'lucide-react';
import debounce from 'lodash/debounce';
import { Suspense } from 'react';

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

function BlogContent() {
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Number of posts per page
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<'Most valued' | 'Most controversial' | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
  
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();

// Directory: app/blog/page.tsx

  const displayToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tag/fetch');
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTagIds?.length > 0 && { tag_ids: JSON.stringify(selectedTagIds) }),
        ...(sorting && { sorting })
      });
      
      const response = await fetch(
        `/api/blog-post/fetch-all?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          credentials: 'include',
        }
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
  }, [currentPage, searchQuery, selectedTagIds, sorting]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sorting]);

  useEffect(() => {
    // Only fetch after component is mounted and localStorage is available
    if (typeof window !== 'undefined') {
      fetchPosts();
    }
  }, [fetchPosts, currentPage, user]);

  const updateUrlParams = useCallback((
    page: number,
    query: string,
    tagIds: string[],
    sortingValue: string | null
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(query && { search: query }),
      ...(tagIds.length > 0 && { tag_ids: JSON.stringify(tagIds) }),
      ...(sortingValue && { sorting: sortingValue })
    });
    router.push(`/blog?${params.toString()}`);
  }, [router]);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      updateUrlParams(1, query, selectedTagIds, sorting);
    }, 300),
    [updateUrlParams, selectedTagIds, sorting]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleTagSelect = (tagId: string) => {
    const newSelectedTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(newSelectedTags);
    updateUrlParams(1, searchQuery, newSelectedTags, sorting);
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const query = searchParams.get('search') || '';
    const tagIdsParam = searchParams.get('tag_ids');
    const tag_ids = tagIdsParam ? JSON.parse(tagIdsParam) : [];
    const sortingParam = searchParams.get('sorting') || null;
  
    setCurrentPage(page);
    setSearchQuery(query);
    setSelectedTagIds(tag_ids);
    setSorting(sortingParam as typeof sorting);
  
    fetchTags();
  }, [searchParams, fetchTags]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

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
    displayToast('Link copied to clipboard!', 'success');
  };

  const handleReport = (type: 'BLOG_POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  const handleCreatePost = async (data: { title: string; description: string; tag_ids: number[] }) => {
    try {
      const response = await fetch('/api/blog-post/create', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }),
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        await fetchPosts();
        displayToast('Post created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Blog Posts
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Share code and ideas: get feedback, votes, and comments
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="space-y-6 mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <h3 className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <LucideTag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.id.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105
                  ${selectedTagIds.includes(tag.id.toString())
                    ? 'bg-blue-500 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

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
          </div>
          {user && (
            <button
              onClick={() => setIsPostModalOpen(true)}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-white' : 'border-gray-900'
              }`} />
            </div>
          ) : posts?.length > 0 ? (
            <>
              <div className="space-y-4">
                {posts?.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onShare={handleShare}
                    onReport={handleReport}
                    onSelect={() => router.push(`/blog/${post.id}`)}
                    showEditDelete={false}
                    displayToast={displayToast}
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

      {/* Share Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      )}

      {/* Blog Post Modal for Creating New Post */}
      <BlogPostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
        }}
        onSubmit={handleCreatePost}
        mode='create'
      />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}