'use client';

import { AlertCircle, Check, Eye, FileText, MessageSquare } from 'lucide-react';
import { type ReportContent } from '@/app/reports/page';

interface ReportCardProps {
    item: ReportContent;
    isDarkMode: boolean;
    onViewContent: (content: ReportContent) => void;
    onHideContent: (type: 'BLOG_POST' | 'COMMENT', contentId: number, currentlyHidden: boolean) => void;
}

export function ReportCard({ item, isDarkMode, onViewContent, onHideContent }: ReportCardProps) {
    return (
        <div className={`rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-6 flex flex-col`}>
            <div className="flex items-center gap-2 mb-4">
                {item.type === 'BLOG_POST' ? (
                    <FileText className="h-5 w-5" />
                ) : (
                    <MessageSquare className="h-5 w-5" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isHidden
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                    {item.isHidden ? 'Hidden' : 'Visible'}
                </span>
            </div>

            <div className="flex-1 space-y-4">
                <div>
                    <h3 className="font-medium mb-2">Latest Report</h3>
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="font-medium">Reason:</span>{' '}
                            {item.reports[0].reason}
                        </p>
                        <p>
                            <span className="font-medium">Explanation:</span>{' '}
                            {item.reports[0].explanation}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                            Reported by: {item.reports[0].reporter.firstName} {item.reports[0].reporter.lastName}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onViewContent(item)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                        View Content
                    </button>
                    <button
                        onClick={() => onHideContent(item.type, item.id, item.isHidden)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                            item.isHidden
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
        </div>
    );
}
