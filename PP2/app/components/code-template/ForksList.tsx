import React, { useState } from 'react';
import Link from 'next/link';
import { GitFork, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Fork {
    id: number;
    title: string;
    createdAt: string;
    author: {
        firstName: string;
        lastName: string;
    };
}

interface ForksListProps {
    forks: Fork[];
    isDarkMode: boolean;
    itemsPerPage?: number;
}

const ForksList = ({ forks, isDarkMode, itemsPerPage = 5 }: ForksListProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(forks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentForks = forks.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
    };

    const PaginationButton = ({ 
        page, 
        isActive = false,
        children 
    }: { 
        page: number, 
        isActive?: boolean,
        children: React.ReactNode 
    }) => (
        <button
            onClick={() => goToPage(page)}
            disabled={isActive}
            className={`
                px-3 py-1 rounded-md text-sm font-medium
                ${isActive 
                    ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                    : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                }
                transition-colors duration-200
                disabled:cursor-not-allowed
            `}
            aria-current={isActive ? 'page' : undefined}
        >
            {children}
        </button>
    );

    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                    p-1 rounded-md
                    ${isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600'
                        : 'text-gray-700 hover:bg-gray-100 disabled:text-gray-300'
                    }
                    transition-colors duration-200
                    disabled:cursor-not-allowed
                `}
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
        );

        // First page if not visible
        if (startPage > 1) {
            buttons.push(
                <PaginationButton key={1} page={1}>1</PaginationButton>,
                <span key="start-ellipsis" className={`px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>
            );
        }

        // Visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <PaginationButton key={i} page={i} isActive={i === currentPage}>
                    {i}
                </PaginationButton>
            );
        }

        // Last page if not visible
        if (endPage < totalPages) {
            buttons.push(
                <span key="end-ellipsis" className={`px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>...</span>,
                <PaginationButton key={totalPages} page={totalPages}>
                    {totalPages}
                </PaginationButton>
            );
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                    p-1 rounded-md
                    ${isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 disabled:text-gray-600'
                        : 'text-gray-700 hover:bg-gray-100 disabled:text-gray-300'
                    }
                    transition-colors duration-200
                    disabled:cursor-not-allowed
                `}
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        );

        return buttons;
    };

    return (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 transition-colors duration-200`}>
            <div className="flex items-center gap-2 mb-6">
                <GitFork 
                    className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Forks ({forks.length})
                </h2>
            </div>

            <div className="space-y-4">
                {currentForks.map((fork) => (
                    <div
                        key={fork.id}
                        className={`
                            group flex flex-col md:flex-row md:items-center md:justify-between
                            p-4 rounded-lg border 
                            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                            hover:border-blue-500
                            transition-colors duration-200
                        `}
                    >
                        <div className="space-y-2 md:space-y-1">
                            <Link
                                href={`/code-template/${fork.id}`}
                                className={`
                                    text-lg font-medium
                                    ${isDarkMode 
                                        ? 'text-blue-400 hover:text-blue-300' 
                                        : 'text-blue-500 hover:text-blue-600'}
                                    transition-colors duration-200
                                `}
                            >
                                {fork.title}
                            </Link>
                            <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span>
                                    by {fork.author.firstName} {fork.author.lastName}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(fork.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/code-template/${fork.id}`}
                            className={`
                                hidden md:flex items-center gap-2 px-4 py-2 mt-4 md:mt-0
                                text-sm font-medium
                                ${isDarkMode 
                                    ? 'text-gray-300 hover:text-blue-400' 
                                    : 'text-gray-600 hover:text-blue-500'}
                                group-hover:translate-x-1 transition-all duration-200
                            `}
                        >
                            View Fork
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>

            {forks.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No forks yet
                </div>
            ) : (
                <div className="mt-6 flex justify-center items-center gap-2">
                    {renderPaginationButtons()}
                </div>
            )}
        </div>
    );
};

export default ForksList;