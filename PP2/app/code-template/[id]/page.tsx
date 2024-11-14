'use client';

import { useParams } from 'next/navigation';
import { useTheme } from '@/app/components/theme/ThemeContext';
import CodeTemplateDetails from '@/app/components/code-template/CodeTemplateDetails';
import Navbar from '@/app/components/Navbar';

export default function CodeTemplatePage() {
    const params = useParams();
    const templateId = params.id;

    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Navigation Bar */}
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            {/* Code Template Details */}
            <CodeTemplateDetails templateId={Number(templateId)} />;
        </div>
    )
}