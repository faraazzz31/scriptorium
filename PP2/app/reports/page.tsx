// app/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import { useTheme } from '@/app/components/theme/ThemeContext';
import { FilterButtons } from '@/app/components/reports/FilterButtons';
import { ReportCard } from '@/app/components/reports/ReportCard';
import { ContentModal } from '@/app/components/reports/ContentModal';

export interface AuthorInfo {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
}

export interface BlogPostInfo {
    id: number;
    title: string;
}

export interface Report {
    id: number;
    reason: string;
    explanation: string;
    status: string;
    createdAt: string;
    reporter: AuthorInfo;
}

export interface BaseContent {
    id: number;
    reportCount: number;
    reports: Report[];
    isHidden: boolean;
}

export interface BlogPostContent extends BaseContent {
    type: 'BLOG_POST';
    content: {
        id: number;
        title: string;
        description: string;
        author: AuthorInfo;
    };
}

export interface CommentContent extends BaseContent {
    type: 'COMMENT';
    content: {
        id: number;
        text: string;
        author: AuthorInfo;
        blogPost: BlogPostInfo | null;
    };
}

export type ReportContent = BlogPostContent | CommentContent;

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
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
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
            const response = await fetchWithAuth(url);
            const data = await response.json();

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

    useEffect(() => {
        fetchReports();
    }, [filterType, filterStatus]);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            <div className="container mx-auto p-6 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">Content Reports</h1>

                    <FilterButtons
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading reports...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((item) => (
                            <ReportCard
                                key={`${item.type}-${item.id}`}
                                item={item}
                                onViewContent={setSelectedContent}
                                onHideContent={handleHideContent}
                            />
                        ))}
                    </div>
                )}

                {selectedContent && (
                    <ContentModal
                        content={selectedContent}
                        onClose={() => setSelectedContent(null)}
                    />
                )}
            </div>
        </div>
    );
}