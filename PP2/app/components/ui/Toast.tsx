import { FC, useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error';
}

const Toast: FC<ToastProps> = ({ message, onClose, duration = 3000, type = 'success' }) => {
  const { isDarkMode } = useTheme();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Start exit animation before actually removing
    const exitTimer = setTimeout(() => setIsLeaving(true), duration - 300);
    // Remove after exit animation
    const removeTimer = setTimeout(onClose, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className={`
        min-w-[300px] px-6 py-4 rounded-lg shadow-lg
        flex items-center gap-3
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'animate-fade-out' : 'animate-fade-in'}
        ${isDarkMode 
          ? 'bg-gray-800 text-white shadow-gray-900/20' 
          : 'bg-white text-gray-900 shadow-gray-200/50'
        }
      `}>
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        )}
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};


export default Toast;