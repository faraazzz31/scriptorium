'use client';

import React from 'react';
import { FileText, MessageSquare, Clock, CheckCircle, LayoutGrid } from 'lucide-react';
import { useTheme } from '@/app/components/theme/ThemeContext';

interface FilterButtonsProps {
    filterType: 'ALL' | 'BLOG_POST' | 'COMMENT';
    setFilterType: (type: 'ALL' | 'BLOG_POST' | 'COMMENT') => void;
    filterStatus: 'PENDING' | 'RESOLVED' | null;
    setFilterStatus: (status: 'PENDING' | 'RESOLVED' | null) => void;
}

export function FilterButtons({ filterType, setFilterType, filterStatus, setFilterStatus }: FilterButtonsProps) {
    const { isDarkMode } = useTheme();

    return (
        <div className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-4 rounded-xl border shadow-sm`}>
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Content Type Filters */}
                <div className="flex-1 space-y-2">
                    <h3 className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } mb-3 flex items-center gap-2`}>
                        <LayoutGrid className="h-4 w-4" />
                        Content Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'ALL', label: 'All Reports', icon: LayoutGrid },
                            { value: 'BLOG_POST', label: 'Blog Posts', icon: FileText },
                            { value: 'COMMENT', label: 'Comments', icon: MessageSquare }
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setFilterType(value as 'ALL' | 'BLOG_POST' | 'COMMENT')}
                                className={`
                                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                    transform transition-all duration-200
                                    ${filterType === value
                                    ? 'bg-blue-500 text-white shadow-md scale-105 hover:bg-blue-600'
                                    : isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <Icon className={`h-4 w-4 ${
                                    filterType === value
                                        ? 'text-white'
                                        : isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                }`} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex-1 space-y-2">
                    <h3 className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } mb-3 flex items-center gap-2`}>
                        <Clock className="h-4 w-4" />
                        Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'PENDING', label: 'Pending', icon: Clock },
                            { value: 'RESOLVED', label: 'Resolved', icon: CheckCircle }
                        ].map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setFilterStatus(filterStatus === value ? null : value as 'PENDING' | 'RESOLVED')}
                                className={`
                                    relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                    transform transition-all duration-200
                                    ${filterStatus === value
                                    ? 'bg-blue-500 text-white shadow-md scale-105 hover:bg-blue-600'
                                    : isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <Icon className={`h-4 w-4 ${
                                    filterStatus === value
                                        ? 'text-white'
                                        : isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                }`} />
                                {label}
                                {filterStatus === value && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}