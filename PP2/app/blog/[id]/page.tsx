// app/blog/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogPostCard from '@/app/components/blog/BlogPostCard';
import CommentSection from '@/app/components/blog/CommentSection';
import ReportModal from '@/app/components/blog/ReportModal';
import { BlogPostWithRelations } from '@/app/blog/page';
import Navbar from '@/app/components/Navbar';
import Toast from '@/app/components/ui/Toast';
import { useTheme } from '@/app/components/theme/ThemeContext';
import BlogPostModal from '@/app/components/blog/BlogPostModal';
import DeleteModal from '@/app/components/blog/DeleteModal';
import ErrorPage from '@/app/components/ErrorPage';

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [postNotFound, setPostNotFound] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'BLOG_POST' | 'COMMENT', id: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [editingPost, setEditingPost] = useState<BlogPostWithRelations | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };


  const fetchPost = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/blog-post/${params.id}`, {
          method: 'GET',
          headers: new Headers({
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }),
          credentials: 'include'
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          setPostNotFound(true);
        } else {
          throw new Error('Error fetching post');
        }
      } else {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchPost();
  }, [params.id, router, fetchPost]);

  useEffect(() => {
    // Only fetch after component is mounted and localStorage is available
    if (typeof window !== 'undefined') {
      fetchPost();
    }
  }, [params.id, fetchPost]);

  const handleEditPost = async (data: { title: string; description: string; tag_ids: number[] }) => {
    try {
      const response = await fetch('/api/blog-post/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          blogPostId: post?.id,
          ...data
        }),
      });
  
      if (response.ok) {
        // After successful edit, fetch the complete post data again
        const postResponse = await fetch(`/api/blog-post/${params.id}`, {
          method: 'GET',
          headers: new Headers({
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : '',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }),
          credentials: 'include'
        });
        if (postResponse.ok) {
          const updatedPost = await postResponse.json();
          setPost(updatedPost);
          setEditingPost(null);
          showToastMessage('Post updated successfully', 'success');
        }
      } else {
        const error = await response.json();
        if (response.status === 403 && error.error === "Blog post is hidden, can't be edited") {
          showToastMessage("Blog post is hidden, can't be edited", 'error');
        } else {
          showToastMessage('Error updating post', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showToastMessage('Error updating post', 'error');
    }
  };
  
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/blog-post/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ blogPostId: post?.id }),
      });
  
      if (response.ok) {
        setShowDeleteModal(false);
        setIsDeleting(false);
        handleDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setShowDeleteModal(false);
      setIsDeleting(false);
      showToastMessage('Error deleting post', 'error');
    }
  };

  const handleDeleteSuccess = () => {
    showToastMessage('Post deleted successfully', 'success');
    // Wait for a short moment to let the user see the toast
    setTimeout(() => {
      router.push('/blog');
    }, 3000);
  };

  const handleShare = (postId: number) => {
    const url = `${window.location.origin}/blog/${postId}`;
    navigator.clipboard.writeText(url);
    showToastMessage('Link copied to clipboard!', 'success');
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

  if (postNotFound) {
    return <ErrorPage message="Blog post not found" status={404} />;
  }

  if (!post) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      {/* Main Content (Blog Post & Comments)*/}
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
          onShare={handleShare}
          onReport={handleReport}
          onEdit={setEditingPost}
          onDelete={() => setShowDeleteModal(true)}
          expanded
          showEditDelete={true}
        />
        
        <div className="mt-8">
          <CommentSection postId={post.id} />
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
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      )}

      {/* Edit Modal */}
      <BlogPostModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSubmit={handleEditPost}
        initialData={post}
        mode="edit"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        onSuccess={handleDeleteSuccess}
        title={post?.title || ''}
        loading={isDeleting}
      />
    </div>
  );
}