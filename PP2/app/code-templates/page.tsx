'use client';

import CodeTemplatesList from '@/app/components/code-template/CodeTemplateList';
import { useTheme } from '@/app/components/theme/ThemeContext';
import Navbar from '@/app/components/Navbar';

export default function CodeTemplatesPage() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Navigation Bar */}
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {/* Code Templates List */}
            <CodeTemplatesList />
        </div>
    );
}