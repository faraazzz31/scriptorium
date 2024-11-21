import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import type { BlogPostWithRelations } from '@/app/blog/page';

interface BlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; tag_ids: number[] }) => Promise<void>;
  initialData?: BlogPostWithRelations | null;
  mode: 'create' | 'edit';
}

export default function BlogPostModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode 
}: BlogPostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setSelectedTags(initialData.tags.map(tag => tag.id));
    } else {
      setTitle('');
      setDescription('');
      setSelectedTags([]);
    }
  }, [initialData, mode]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tag/fetch', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, tag_ids: selectedTags });
      onClose();
    } catch (error) {
      console.error('Error submitting blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`relative w-full max-w-2xl rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 rounded ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'border border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`w-full p-2 rounded ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'border border-gray-300'
                }`}
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <label
                    key={tag.id}
                    className={`flex items-center space-x-2 p-2 rounded ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag.id]);
                        } else {
                          setSelectedTags(selectedTags.filter(id => id !== tag.id));
                        }
                      }}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded text-white ${
                  isDarkMode 
                    ? 'bg-teal-600 hover:bg-teal-700' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}