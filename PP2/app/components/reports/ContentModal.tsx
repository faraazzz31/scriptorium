'use client';

import { X } from 'lucide-react';
import { type ReportContent } from '@/app/reports/page';

interface ContentModalProps {
    content: ReportContent;
    isDarkMode: boolean;
    onClose: () => void;
}

export function ContentModal({ content, isDarkMode, onClose }: ContentModalProps) {
    const getContentPreview = (item: ReportContent) => {
        if (item.type === 'BLOG_POST') {
            return (
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{item.content.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.content.description}</p>
                </div>
            );
        } else {
            return (
                <div className="space-y-2">
                    <p className="text-sm">{item.content.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        On post: {item.content.blogPost?.title}
                    </p>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`relative w-full max-w-lg rounded-lg p-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <X className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold mb-4">
                    {content.type === 'BLOG_POST' ? 'Blog Post' : 'Comment'} Content
                </h3>
                {getContentPreview(content)}
            </div>
        </div>
    );
}