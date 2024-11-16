// app/blog/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogPostCard from '@/app/components/blog/BlogPostCard';
import CommentSection from '@/app/components/blog/CommentSection';
import ReportModal from '@/app/components/blog/ReportModal';
import { BlogPostWithRelations } from '@/app/blog/page';
import Navbar from '@/app/components/Navbar';
import { useTheme } from '@/app/components/theme/ThemeContext';

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog-post/${params.id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  const handleVote = async (postId: number, type: 'UPVOTE' | 'DOWNVOTE', change: 1 | -1) => {
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
        setPost(prev => 
          prev ? { ...prev, upvotes: updatedPost.upvotes, downvotes: updatedPost.downvotes } : null
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/blog/${postId}`;
    navigator.clipboard.writeText(url);
    // Add toast notification here
  };

  const handleReport = (type: 'BLOG_POST' | 'COMMENT', id: number) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="container mx-auto p-4">
          <div className="flex justify-center p-4">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkMode ? 'border-white' : 'border-gray-900'
            }`} />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="container mx-auto p-4">
        <button
          onClick={() => router.back()}
          className={`mb-4 px-4 py-2 rounded ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          ← Back
        </button>
        
        <BlogPostCard
          post={post}
          viewMode="card"
          onVote={handleVote}
          onShare={handleShare}
          onReport={handleReport}
          expanded
        />
        
        <div className="mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>

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
}