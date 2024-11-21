import { FC, useState } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import Toast from '../ui/Toast';

interface ReportModalProps {
  type: 'BLOG_POST' | 'COMMENT';
  contentId: number;
  onClose: () => void;
}

const ReportModal: FC<ReportModalProps> = ({ type, contentId, onClose }) => {
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!user) {
      setToastMessage('Please log in to report content');
      setShowToast(true);
      return;
    }
    
    if (!reason || !explanation) {
      setToastMessage('Please provide both reason and explanation');
      setShowToast(true);
      return;
    }

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
        setToastMessage('Report submitted successfully');
        setShowToast(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        const data = await response.json();
        if (data.error === 'You have already reported this blog post') {
          setToastMessage(data.error);
          setShowToast(true);
        } else {
          setToastMessage('Error submitting report');
          setShowToast(true);
        }
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
        <div className="space-y-6">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Reason
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`mt-1 block w-full rounded-md px-3 py-2 border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter the reason for reporting"
            />
          </div>
          <div>
            <label htmlFor="explanation" className="block text-sm font-medium mb-2">
              Explanation
            </label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className={`mt-1 block w-full rounded-md px-3 py-2 border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Provide a detailed explanation"
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
      {/* Rejection Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastMessage === 'Report submitted successfully' ? 'success' : 'error'}
        />
      )}
    </div>
  );
};

export default ReportModal;