'use client';

import { AlertCircle, Check, Eye, FileText, MessageSquare, AlertTriangle, User, ChevronDown, ChevronUp, BookOpenText } from 'lucide-react';
import { type ReportContent } from '@/app/reports/page';
import { useTheme } from '@/app/components/theme/ThemeContext';
import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
    isDarkMode: boolean;
}

function ExpandableText({ text, maxLength = 150, isDarkMode }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text.length > maxLength;

    const displayText = shouldTruncate && !isExpanded
        ? text.slice(0, maxLength) + '...'
        : text;

    return (
        <div className="space-y-1">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {displayText}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`text-xs font-medium ${
                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}

interface ReportCardProps {
    item: ReportContent;
    onViewContent: (content: ReportContent) => void;
    onHideContent: (type: 'BLOG_POST' | 'COMMENT', contentId: number, currentlyHidden: boolean) => void;
}

export function ReportCard({ item, onViewContent, onHideContent }: ReportCardProps) {
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const displayedReports = isExpanded ? item.reports : [item.reports[0]];

    return (
        <div className={`rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6 flex flex-col justify-between transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1 h-full`}>
            {/* Main Content Wrapper */}
            <div className="flex flex-col gap-4">
                {/* Header Section */}
                <div className={`flex items-center justify-between border-b pb-4 ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            item.type === 'BLOG_POST'
                                ? isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                                : isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                        }`}>
                            {item.type === 'BLOG_POST' ? (
                                <FileText className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                            ) : (
                                <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                            )}
                        </div>
                        <div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.type === 'BLOG_POST' ? 'Blog Post' : 'Comment'}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                item.isHidden
                                    ? isDarkMode
                                        ? 'bg-red-900 text-red-200'
                                        : 'bg-red-100 text-red-800'
                                    : isDarkMode
                                        ? 'bg-green-900 text-green-200'
                                        : 'bg-green-100 text-green-800'
                            }`}>
                                {item.isHidden ? 'Hidden' : 'Visible'}
                            </span>
                        </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                        {item.reportCount} Reports
                    </span>
                </div>

                {/* Reports Section */}
                <div className="space-y-4">
                    {displayedReports.map((report, index) => (
                        <div key={report.id} className={`p-4 rounded-lg border ${
                            isDarkMode
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-gray-50 border-gray-200'
                        }`}>
                            {/* Report Header */}
                            <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
                                isDarkMode ? 'border-gray-600' : 'border-gray-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-green-500" />
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {report.reporter.firstName} {report.reporter.lastName}
                                    </span>
                                </div>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Report #{index + 1}
                                </span>
                            </div>

                            {/* Reason */}
                            <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Reason
                                    </h4>
                                </div>
                                <div className="ml-6">
                                    <ExpandableText text={report.reason} isDarkMode={isDarkMode} />
                                </div>
                            </div>

                            {/* Explanation */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpenText className="h-4 w-4 text-blue-500" />
                                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                        Explanation
                                    </h4>
                                </div>
                                <div className="ml-6">
                                    <ExpandableText text={report.explanation} isDarkMode={isDarkMode} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show More/Less Reports Button */}
                {item.reports.length > 1 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center justify-center gap-1 text-sm font-medium py-2 rounded-lg transition-colors ${
                            isDarkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Show {item.reports.length - 1} More {item.reports.length - 1 === 1 ? 'Report' : 'Reports'}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Action Buttons - Always at Bottom */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onViewContent(item)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors flex-1 justify-center
                    ${isDarkMode
                        ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                        : 'border-gray-300 bg-white hover:bg-gray-100'
                    }`}
                >
                    <Eye className="h-4 w-4" />
                    View Content
                </button>
                <button
                    onClick={() => onHideContent(item.type, item.id, item.isHidden)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors flex-1 justify-center
                    ${item.isHidden
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                    {item.isHidden ? (
                        <>
                            <Check className="h-4 w-4" />
                            Unhide
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-4 w-4" />
                            Hide
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}