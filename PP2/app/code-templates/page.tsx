'use client';

import CodeTemplatesList from '@/app/components/code-template/CodeTemplateList';
import { useTheme } from '@/app/components/theme/ThemeContext';
import Navbar from '@/app/components/Navbar';
import { Suspense } from 'react';

function CodeTemplatesContent() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <CodeTemplatesList />
      </div>
    );
  }
  
  export default function CodeTemplatesPage() {
    return (
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }>
        <CodeTemplatesContent />
      </Suspense>
    );
  }