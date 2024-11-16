'use client';

import { X, FileText, MessageSquare, User, Calendar, Clock, Link } from 'lucide-react';
import { type ReportContent } from '@/app/reports/page';
import { useTheme } from '@/app/components/theme/ThemeContext';

interface ContentModalProps {
    content: ReportContent;
    onClose: () => void;
}

export function ContentModal({ content, onClose }: ContentModalProps) {
    const { isDarkMode } = useTheme();

    const getContentPreview = (item: ReportContent) => {
        if (item.type === 'BLOG_POST') {
            return (
                <div className="space-y-4">
                    {/* Content Type Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                    }`}>
                        <FileText className={`h-4 w-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                            Blog Post
                        </span>
                    </div>

                    {/* Title Section */}
                    <div className={`p-4 rounded-lg border ${
                        isDarkMode
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <h3 className={`font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.content.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.content.description}
                        </p>
                    </div>

                    {/* Author Info */}
                    <div className={`p-4 rounded-lg border ${
                        isDarkMode
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                                isDarkMode ? 'bg-green-900' : 'bg-green-100'
                            }`}>
                                <User className={`h-4 w-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {item.content.author.firstName} {item.content.author.lastName}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {item.content.author.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="space-y-4">
                    {/* Content Type Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                    }`}>
                        <MessageSquare className={`h-4 w-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                            Comment
                        </span>
                    </div>

                    {/* Comment Content */}
                    <div className={`p-4 rounded-lg border ${
                        isDarkMode
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.content.text}
                        </p>
                    </div>

                    {/* Related Post Info */}
                    <div className={`p-4 rounded-lg border ${
                        isDarkMode
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <h4 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            <Link className="h-4 w-4" />
                            Related Post
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.content.blogPost?.title}
                        </p>
                    </div>

                    {/* Author Info */}
                    <div className={`p-4 rounded-lg border ${
                        isDarkMode
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                                isDarkMode ? 'bg-green-900' : 'bg-green-100'
                            }`}>
                                <User className={`h-4 w-4 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {item.content.author.firstName} {item.content.author.lastName}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {item.content.author.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
                className={`relative w-full max-w-lg rounded-xl p-6 shadow-xl transform transition-all duration-200 ${
                    isDarkMode
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-gray-200'
                }`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                        isDarkMode
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content Preview */}
                {getContentPreview(content)}
            </div>

            {/* Click Outside to Close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}