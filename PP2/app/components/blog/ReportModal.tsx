import { FC, useState } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

interface ReportModalProps {
  type: 'BLOG_POST' | 'COMMENT';
  contentId: number;
  onClose: () => void;
}

const ReportModal: FC<ReportModalProps> = ({ type, contentId, onClose }) => {
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!user || !reason || !explanation) return;

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          type,
          reason,
          explanation,
          [type === 'BLOG_POST' ? 'blogPostId' : 'commentId']: contentId,
        }),
      });

      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`rounded-lg p-6 max-w-md w-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className="text-xl font-semibold mb-4">Report Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'border-gray-700' 
                  : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block mb-2">Explanation</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className={`w-full p-2 rounded border ${
                isDarkMode 
                  ? 'border-gray-700' 
                  : 'border-gray-300'
              }`}
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded text-white ${
                isDarkMode
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;