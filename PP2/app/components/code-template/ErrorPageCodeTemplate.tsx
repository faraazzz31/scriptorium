import { useTheme } from '@/app/components/theme/ThemeContext';
import { useRouter } from 'next/navigation';

interface ErrorPageCodeTemplateProps {
  message: string;
  status: number;
}

export default function ErrorPageCodeTemplate({ message, status }: ErrorPageCodeTemplateProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <h1 className="text-4xl font-bold mb-4">{status}</h1>
      <p className="text-xl mb-8">{message}</p>
      <button
        onClick={() => router.push('/code-templates')}
        className={`px-4 py-2 rounded ${
          isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Go to Code Templates
      </button>
    </div>
  );
}