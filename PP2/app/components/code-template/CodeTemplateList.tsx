import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Code2, GitFork, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { useTheme } from '@/app/components/theme/ThemeContext';
import debounce from 'lodash/debounce';
import { kebabCase } from 'lodash';

interface CodeTemplate {
    id: number;
    title: string;
    code: string;
    explanation: string;
    language: string;
    createdAt: string;
    authorId: number;
    tags: { id: number; name: string }[];
    author: { firstName: string; lastName: string };
    forks: {
        id: number;
        title: string;
        createdAt: string;
        author: { id: number; firstName: string; lastName: string };
    }[];
}

interface PaginationButtonProps {
    page: number;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const CodeTemplatesList = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();

    // State for templates and pagination
    const [templates, setTemplates] = useState<CodeTemplate[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagId, setSelectedTagId] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [showMyTemplates, setShowMyTemplates] = useState(false);
    const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
    const [limit] = useState(6);

    // Calculate total pages based on totalCount and limit
    const totalPages = Math.ceil(totalCount / limit);

    const fetchTags = useCallback(async () => {
        try {
            const response = await fetch('/api/tag/fetch');
            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    }, []);

    const fetchTemplates = useCallback(async (
        page: number,
        query: string,
        tagId: string,
        language: string,
        showOwn: boolean
    ) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(query && { query }),
                ...(tagId && { tag_id: tagId }),
                ...(language && { language })
            });

            let response;
            if (showOwn) {
                response = await fetch(`api/code-template/fetch-user?${params}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
            } else {
                response = await fetch(`/api/code-template/fetch-all?${params}`);
            }

            if (response.ok) {
                const data = await response.json();
                setTemplates(data.data);
                setTotalCount(data.totalCount);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        // Initialize filters from URL params
        const page = parseInt(searchParams.get('page') || '1');
        const query = searchParams.get('query') || '';
        const tagId = searchParams.get('tag_id') || '';
        const language = searchParams.get('language') || '';
        const showOwn = searchParams.get('showOwn') === 'true';
    
        // Ensure page is within valid range
        const validPage = Math.min(Math.max(1, page), totalPages || 1);
    
        setCurrentPage(validPage);
        setSearchQuery(query);
        setSelectedTagId(tagId);
        setSelectedLanguage(language);
        setShowMyTemplates(showOwn);
    
        fetchTags();
        fetchTemplates(validPage, query, tagId, language, showOwn);
    }, [searchParams, totalPages, fetchTemplates, fetchTags]);

    const availableLanguages = [
        {
            key: 'python',
            name: 'Python',
        },
        {
            key: 'javascript',
            name: 'JavaScript',
        },
        {
            key: 'java',
            name: 'Java',
        },
        {
            key: 'c',
            name: 'C',
        },
        {
            key: 'cpp',
            name: 'C++',
        },
        {
            key: 'php',
            name: 'PHP',
        },
        {
            key: 'go',
            name: 'Go',
        },
        {
            key: 'typescript',
            name: 'TypeScript',
        },
        {
            key: 'ruby',
            name: 'Ruby',
        },
        {
            key: 'kotlin',
            name: 'Kotlin',
        },
    ]

    const updateUrlParams = useCallback((
        page: number,
        query: string,
        tagId: string,
        language: string,
        showOwn: boolean
    ) => {
        const params = new URLSearchParams({
            page: page.toString(),
            ...(query && { query }),
            ...(tagId && { tag_id: tagId }),
            ...(language && { language }),
            showOwn: showOwn.toString()
        });
        router.push(`/code-templates?${params.toString()}`);
    }, [router]);

    // Create a debounced version of the search
    const debouncedSearch = useMemo(
        () => debounce((query: string) => {
            updateUrlParams(1, query, selectedTagId, selectedLanguage, showMyTemplates);
        }, 300),
        [updateUrlParams, selectedTagId, selectedLanguage, showMyTemplates]
    );

    // Don't forget to cleanup
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // In your handleSearch function
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleTagSelect = (tagId: string) => {
        setSelectedTagId(tagId === selectedTagId ? '' : tagId);
        updateUrlParams(1, searchQuery, tagId === selectedTagId ? '' : tagId, selectedLanguage, showMyTemplates);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrlParams(page, searchQuery, selectedTagId, selectedLanguage, showMyTemplates);
    };

    const handleLanguageSelect = (language: string) => {
        setSelectedLanguage(language === selectedLanguage ? '' : language);
        updateUrlParams(1, searchQuery, selectedTagId, language === selectedLanguage ? '' : language, showMyTemplates);
    };

    const toggleMyTemplates = () => {
        const newValue = !showMyTemplates;
        setShowMyTemplates(newValue);
        updateUrlParams(1, searchQuery, selectedTagId, selectedLanguage, newValue);
    };

    const PaginationButton: React.FC<PaginationButtonProps> = ({ isActive, onClick, disabled = false, children }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {children}
        </button>
    );

    const renderPagination = () => {
        // Don't show pagination if there's only one page or no items
        if (totalPages <= 1) return null;

        const pages = [];
        const showEllipsis = totalPages > 7;

        if (showEllipsis) {
            if (currentPage <= 3) {
                // Show first 3 pages + ellipsis + last page
                for (let i = 1; i <= Math.min(3, totalPages); i++) {
                    pages.push(i);
                }
                if (totalPages > 4) {
                    pages.push('ellipsis');
                    pages.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                // Show first page + ellipsis + last 3 pages
                pages.push(1);
                if (totalPages > 4) {
                    pages.push('ellipsis');
                }
                for (let i = Math.max(totalPages - 2, 2); i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show first page + ellipsis + current and adjacent pages + ellipsis + last page
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                if (currentPage + 2 < totalPages) {
                    pages.push('ellipsis');
                }
                pages.push(totalPages);
            }
        } else {
            // Show all pages if there are 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <PaginationButton
                    page={currentPage - 1}
                    isActive={false}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </PaginationButton>

                {pages.map((page, index) => (
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="px-4 py-2">...</span>
                    ) : (
                        <PaginationButton
                            key={page}
                            page={Number(page)}
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(Number(page))}
                        >
                            {page}
                        </PaginationButton>
                    )
                ))}

                <PaginationButton
                    page={currentPage + 1}
                    isActive={false}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="w-4 h-4" />
                </PaginationButton>
            </div>
        );
    };

        // Add page information display
        const renderPageInfo = () => {
            if (totalCount === 0) return null;

            const startItem = (currentPage - 1) * limit + 1;
            const endItem = Math.min(currentPage * limit, totalCount);

            return (
                <div className={`text-sm text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {startItem}-{endItem} of {totalCount} templates
                </div>
            );
        };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Code Templates
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Browse and discover reusable code templates
                    </p>
                </div>

                {/* Search and Filters Section */}
                <div className="space-y-6 mb-8">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                                ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            />
                        </div>
                        {user && (
                            <button
                                onClick={toggleMyTemplates}
                                className={`px-6 py-3 rounded-xl text-lg font-medium transition-all transform hover:scale-105
                                ${showMyTemplates
                                    ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600'
                                    : isDarkMode
                                        ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {showMyTemplates ? 'My Templates' : 'All Templates'}
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="space-y-4">
                        {/* Tags */}
                        <div className="space-y-2">
                            <h3 className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <Tag className="w-4 h-4" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagSelect(tag.id.toString())}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105
                                        ${selectedTagId === tag.id.toString()
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : isDarkMode
                                                ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-2">
                            <h3 className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <Code2 className="w-4 h-4" />
                                Languages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {availableLanguages.map((language) => (
                                    <button
                                        key={language.key}
                                        onClick={() => handleLanguageSelect(language.key)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105
                                        ${selectedLanguage === language.key
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : isDarkMode
                                                ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-750'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {language.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : templates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => router.push(`/code-template/${template.id}`)}
                                    className={`rounded-xl transition-all transform hover:scale-102 hover:-translate-y-1 cursor-pointer
                                    ${isDarkMode
                                        ? 'bg-gray-800 border border-gray-700 hover:shadow-lg hover:shadow-blue-500/10' 
                                        : 'bg-white border border-gray-200 hover:shadow-xl'}`}
                                >
                                    <div className="p-6 space-y-4">
                                        {/* Template Header */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {template.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        <GitFork className="w-4 h-4" />
                                                        {template.forks?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                by {template.author.firstName} {template.author.lastName}
                                            </p>
                                        </div>

                                        {/* Template explanation */}
                                        <div className={`space-y-4 text-sm px-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <p className="leading-relaxed tracking-wide">
                                                {template.explanation}
                                            </p>
                                        </div>

                                        {/* Template code */}
                                        <div
                                            className={`rounded-lg p-4 font-mono text-sm overflow-hidden h-48 relative group
                                                ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                                        >
                                            <div className="absolute top-0 right-0 left-0 h-6 bg-gradient-to-b from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <pre className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                                <code className="block whitespace-pre-wrap">
                                                    {template.code}
                                                </code>
                                            </pre>
                                            <div className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Template Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {template.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium
                                                    ${tag.id.toString() === selectedTagId
                                                        ? 'bg-blue-500 text-white'
                                                        : isDarkMode
                                                            ? 'bg-gray-700 text-gray-300'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Template Metadata */}
                                        <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <span className="flex items-center gap-1">
                                                <GitFork className="w-4 h-4" />
                                                {template.forks?.length || 0} forks
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Code2 className="w-4 h-4" />
                                                {availableLanguages.find(language => language.key === template.language)?.name || template.language}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderPagination()}
                        {renderPageInfo()}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No templates found
                        </p>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Try adjusting your search filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeTemplatesList;