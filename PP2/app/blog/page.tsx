'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/app/components/auth/AuthContext';
import BlogPostCard from '@/app/components/blog/BlogPostCard';
import ReportModal from '@/app/components/blog/ReportModal';
import { BlogPost, User, Tag, CodeTemplate } from '@prisma/client';
import Navbar from '../components/Navbar';
import Toast from '../components/ui/Toast';
import { useTheme } from '../components/theme/ThemeContext';
import { useRouter } from 'next/navigation';

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

// Main Component
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'compact' | 'card'>('card');
  const [sorting, setSorting] = useState<'Most valued' | 'Most controversial' | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/blog-post/fetch-all?page=${page}&limit=10${sorting ? `&sorting=${sorting}` : ''}`
      );
      const data: FetchBlogPostsResponse = await response.json();
      
      setPosts(prevPosts => {
        if (prevPosts.length === 0) return data.data;
        else return [...prevPosts, ...data.data];
      });
      setHasMore(page < data.totalPages);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, sorting, loading, hasMore]);

  useEffect(() => {
    if (inView) {
      fetchPosts();
    }
  }, [inView, fetchPosts]);

  const handleVote = async (postId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => {
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
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
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
          {posts.map(post => (
            <BlogPostCard
              key={post.id}
              post={post}
              viewMode={viewMode}
              onVote={handleVote}
              onShare={handleShare}
              onReport={handleReport}
              onSelect={() => router.push(`/blog/${post.id}`)}
            />
          ))}
          {loading && (
            <div className="flex justify-center p-4">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-white' : 'border-gray-900'
              }`} />
            </div>
          )}
          <div ref={ref} />
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
