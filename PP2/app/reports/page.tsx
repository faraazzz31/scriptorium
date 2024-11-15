'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Eye, FileText, MessageSquare, X } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useTheme } from '@/app/components/theme/ThemeContext';

// Type definitions
interface AuthorInfo {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
}

interface BlogPostInfo {
    id: number;
    title: string;
}

interface Report {
    id: number;
    reason: string;
    explanation: string;
    status: string;
    createdAt: string;
    reporter: AuthorInfo;
}

interface BaseContent {
    id: number;
    reportCount: number;
    reports: Report[];
    isHidden: boolean;
}

interface BlogPostContent extends BaseContent {
    type: 'BLOG_POST';
    content: {
        id: number;
        title: string;
        description: string;
        author: AuthorInfo;
    };
}

interface CommentContent extends BaseContent {
    type: 'COMMENT';
    content: {
        id: number;
        text: string;
        author: AuthorInfo;
        blogPost: BlogPostInfo | null;
    };
}

type ReportContent = BlogPostContent | CommentContent;

export default function ReportsPage() {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [reports, setReports] = useState<ReportContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<ReportContent | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'BLOG_POST' | 'COMMENT'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'PENDING' | 'RESOLVED' | null>(null);

    const refreshAccessToken = async (refreshToken: string) => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const { accessToken } = await response.json();
                localStorage.setItem('accessToken', accessToken);
                return accessToken;
            }
            return null;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    };

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const accessToken = localStorage.getItem('accessToken');
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (response.status === 401) {
                // Token expired, try to refresh
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        // Retry the request with new token
                        const retryResponse = await fetch(url, {
                            ...options,
                            headers: {
                                ...defaultHeaders,
                                'Authorization': `Bearer ${newAccessToken}`,
                                ...options.headers
                            }
                        });
                        return retryResponse;
                    }
                }
                // If refresh failed, throw error
                throw new Error('Authentication failed');
            }

            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filterType !== 'ALL') queryParams.append('type', filterType);
            if (filterStatus) queryParams.append('status', filterStatus);

            const url = `/api/admin/sort-reports?${queryParams}`;
            console.log('Fetching reports from:', url);

            const response = await fetchWithAuth(url);
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');
            setReports(data.results);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleHideContent = async (type: 'BLOG_POST' | 'COMMENT', contentId: number, currentlyHidden: boolean) => {
        try {
            const response = await fetchWithAuth('/api/admin/hide-content', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    contentId: contentId.toString(),
                    hide: !currentlyHidden
                })
            });

            if (!response.ok) throw new Error('Failed to update content visibility');

            fetchReports();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    // Add this after state declarations
    useEffect(() => {
        fetchReports();
    }, [filterType, filterStatus]); // This will fetch reports initially and when filters change

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
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Navigation Bar */}
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            {/* Main Content */}
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">Content Reports</h1>

                    <div className="flex flex-wrap gap-4 mb-6">
                        {/* Content Type Filter */}
                        <div className="flex gap-2">
                            {['ALL', 'BLOG_POST', 'COMMENT'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as 'ALL' | 'BLOG_POST' | 'COMMENT')}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        filterType === type
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {type === 'ALL' ? 'All Reports' : type === 'BLOG_POST' ? 'Blog Posts' : 'Comments'}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {['PENDING', 'RESOLVED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(filterStatus === status ? null : status as 'PENDING' | 'RESOLVED')}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        filterStatus === status
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading reports...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((item) => (
                            <div key={`${item.type}-${item.id}`}
                                 className={`rounded-lg border ${
                                     isDarkMode
                                         ? 'bg-gray-800 border-gray-700'
                                         : 'bg-white border-gray-200'
                                 } p-6 flex flex-col`}
                            >
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
                                    {/* Report Information */}
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
                                            onClick={() => setSelectedContent(item)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Content
                                        </button>
                                        <button
                                            onClick={() => handleHideContent(item.type, item.id, item.isHidden)}
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
                        ))}
                    </div>
                )}

                {/* Modal */}
                {selectedContent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className={`relative w-full max-w-lg rounded-lg p-6 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <button
                                onClick={() => setSelectedContent(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h3 className="text-lg font-semibold mb-4">
                                {selectedContent.type === 'BLOG_POST' ? 'Blog Post' : 'Comment'} Content
                            </h3>
                            {getContentPreview(selectedContent)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}