'use client';

import React from 'react';

interface FilterButtonsProps {
    filterType: 'ALL' | 'BLOG_POST' | 'COMMENT';
    setFilterType: (type: 'ALL' | 'BLOG_POST' | 'COMMENT') => void;
    filterStatus: 'PENDING' | 'RESOLVED' | null;
    setFilterStatus: (status: 'PENDING' | 'RESOLVED' | null) => void;
}

export function FilterButtons({ filterType, setFilterType, filterStatus, setFilterStatus }: FilterButtonsProps) {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
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
    );
}