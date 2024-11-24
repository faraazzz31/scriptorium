import { UserData } from '@/app/components/auth/types';
import { Users, Edit2, Check, X, Trash2, GitFork, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { LoginModal } from '../auth/LoginModal';
import { SignupModal } from '../auth/SignupModal';
import ForkCodeTemplate  from './ForkCodeTemplate';
import Image from 'next/image';

interface Template {
    id: number;
    title: string;
    code: string;
    explanation: string;
    language: string;
    createdAt: string;
    authorId: number;
    tags: { id: number; name: string }[];
    author: { firstName: string; lastName: string, avatar: string };
    forks: {
        id: number;
        title: string;
        createdAt: string;
        author: { id: number; firstName: string; lastName: string };
    }[];
    forkOf: { id: number; title: string; author: { firstName: string; lastName: string } };
    blogPosts: {
        id: number;
        title: string;
        createdAt: string;
        author: { id: number; firstName: string; lastName: string };
    }[]
}

interface TagInterface {
    id: number;
    name: string;
}

interface HeaderProps {
    template: Template;
    user: UserData | null;
    isEditingMeta: boolean;
    isEditing: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    editedTitle: string;
    editedExplanation: string;
    isDarkMode: boolean;
    availableTags: { id: number; name: string }[];
    selectedTags: { id: number; name: string }[];
    setEditedTitle: (title: string) => void;
    setEditedExplanation: (description: string) => void;
    setSelectedTags: (tags: { id: number; name: string }[]) => void;
    setIsEditing: (isEditing: boolean) => void;
    setIsEditingMeta: (isEditing: boolean) => void;
    handleSave: () => void;
    handleDelete: () => void;
    handleTagSelect: (tag: { id: number; name: string }) => void;
}

export const Header = ({
    template,
    user,
    isEditingMeta,
    isEditing,
    isSaving,
    isDeleting,
    editedTitle,
    editedExplanation,
    isDarkMode,
    availableTags,
    selectedTags,
    setEditedTitle,
    setEditedExplanation,
    setIsEditing,
    setIsEditingMeta,
    setSelectedTags,
    handleSave,
    handleDelete,
}: HeaderProps) => {
    // Container styles
    const containerStyles = isDarkMode
        ? "bg-gray-800 border-gray-700 shadow-lg"
        : "bg-white border-gray-200 shadow-md";

    // Input styles
    const inputStyles = isDarkMode
        ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400 placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-500";

    // Title styles
    const titleStyles = isDarkMode
        ? "text-white"
        : "text-gray-900";

    // Text styles
    const textStyles = isDarkMode
        ? "text-gray-300"
        : "text-gray-600";

    const secondaryTextStyles = isDarkMode
        ? "text-gray-400"
        : "text-gray-500";

    // Link styles
    const linkStyles = isDarkMode
        ? "text-blue-400 hover:text-blue-300"
        : "text-blue-600 hover:text-blue-700";

    // Button styles based on variant
    const getButtonStyles = (variant: 'primary' | 'success' | 'danger' | 'secondary') => {
        const baseStyles = "flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-md text-white transition-colors duration-200";

        const variantStyles = {
            primary: isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
            success: isDarkMode
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-500",
            danger: isDarkMode
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-red-500 hover:bg-red-600 focus:ring-red-500",
            secondary: isDarkMode
                ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
                : "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500"
        }[variant];

        return `${baseStyles} ${variantStyles}`;
    };

    const [ isLoginModalOpen, setIsLoginModalOpen ] = useState<boolean>(false);
    const [ isSignupModalOpen, setIsSignupModalOpen ] = useState<boolean>(false);
    const [ isDialogOpen, setIsDialogOpen ] = useState<boolean>(false);

    const handleTagSelect = (tag: TagInterface) => {
        if (selectedTags.some((t) => t.id === tag.id)) {
            setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <div className={`rounded-lg p-6 md:p-8 transition-colors duration-200 ${containerStyles}`}>
            <div className="flex flex-col gap-6">
                {/* Header with Title and Actions */}
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                        {isEditingMeta ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className={`text-2xl md:text-3xl font-bold w-full px-4 py-2.5 rounded-lg border
                                        focus:outline-none focus:ring-2 focus:border-transparent
                                        transition-colors duration-200 ${inputStyles}`}
                                placeholder="Enter title..."
                            />
                        ) : (
                            <h1 className={`text-2xl md:text-3xl font-bold ${titleStyles}`}>
                                {template.title}
                            </h1>
                        )}
                    </div>
    
                    {/* Actions */}
                    <div className="flex items-center gap-3 md:self-start">
                        {user?.id === template.authorId ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={getButtonStyles('primary')}
                                >
                                    {isEditing ? (
                                        <>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Mode
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit Mode
                                        </>
                                    )}
                                </button>
                                {isEditingMeta ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={`${getButtonStyles('success')} disabled:opacity-50`}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditingMeta(false)}
                                            className={getButtonStyles('secondary')}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditingMeta(true)}
                                            className={getButtonStyles('secondary')}
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className={`${getButtonStyles('danger')} disabled:opacity-50`}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setIsDialogOpen(true)}
                                className={isDarkMode
                                    ? "flex items-center px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                                    : "flex items-center px-4 py-2 rounded-lg text-white bg-purple-500 hover:bg-purple-600"
                                }
                            >
                                <GitFork className="w-4 h-4 mr-2" />
                                Fork Template
                            </button>
                        )}
                    </div>
                </div>
    
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Author Info and Metadata */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            {template.author.avatar ? (
                                <Image
                                    src={template.author.avatar.startsWith('/') ? template.author.avatar : `/${template.author.avatar}`}
                                    width={44}
                                    height={44}
                                    alt={`${template.author.firstName} ${template.author.lastName}`}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2 
                                        ${isDarkMode ? 'ring-gray-700 ring-offset-gray-800' : 'ring-gray-100 ring-offset-white'}"
                                />
                            ) : (
                                <div 
                                    className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-medium
                                        ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                                >
                                    {template.author.firstName.charAt(0)}
                                    {template.author.lastName.charAt(0)}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <p className={`text-base font-medium ${titleStyles}`}>
                                    {template.author.firstName} {template.author.lastName}
                                </p>
                                <p className={`text-sm ${secondaryTextStyles}`}>
                                    Created {new Date(template.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
    
                        <div className={`flex items-center gap-6 sm:ml-auto ${secondaryTextStyles}`}>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-5 h-5" />
                                <span className="text-sm font-medium">{template.forks?.length || 0} forks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="w-5 h-5" />
                                <span className="text-sm font-medium">{template.blogPosts?.length || 0} blogs</span>
                            </div>
                        </div>
                    </div>
    
                    {/* Fork Source Info */}
                    {template.forkOf && (
                        <div className={`text-sm ${textStyles} py-2 px-4 rounded-lg 
                            ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                <GitFork className={`w-4 h-4 ${secondaryTextStyles}`} />
                                <span>Forked from{' '}
                                    <Link
                                        href={`/code-template/${template.forkOf.id}`}
                                        className={`${linkStyles} font-medium hover:underline`}
                                    >
                                        {template.forkOf.title}
                                    </Link>
                                    <span className={secondaryTextStyles}>
                                        {' '}by {template.forkOf.author.firstName} {template.forkOf.author.lastName}
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}
    
                    {/* Description */}
                    <div className="space-y-4">
                        {isEditingMeta ? (
                            <textarea
                                value={editedExplanation}
                                onChange={(e) => setEditedExplanation(e.target.value)}
                                className={`text-base w-full px-4 py-3 rounded-lg border
                                        focus:outline-none focus:ring-2 focus:border-transparent
                                        transition-colors duration-200 ${inputStyles}`}
                                placeholder="Enter description..."
                                rows={4}
                            />
                        ) : (
                            <p className={`text-base leading-relaxed ${textStyles}`}>
                                {template.explanation}
                            </p>
                        )}
                    </div>
    
                    {/* Tags */}
                    <div className="space-y-3">
                        <h3 className={`text-sm font-medium ${secondaryTextStyles}`}>Tags</h3>
                        {isEditingMeta ? (
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagSelect(tag)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${selectedTags.some((t) => t.id === tag.id)
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                : isDarkMode
                                                    ? 'bg-gray-750 hover:bg-gray-700 text-gray-300'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="px-4 py-2 rounded-lg text-sm font-medium
                                            bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                    >
                                        {tag.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
    
                {/* Modals */}
                <ForkCodeTemplate
                    forkOfId={template.id}
                    code={template.code}
                    language={template.language}
                    forkedTags={selectedTags}
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onSwitchToLogin={() => setIsLoginModalOpen(true)}
                />
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onSwitchToSignup={() => {
                        setIsLoginModalOpen(false);
                        setIsSignupModalOpen(true);
                    }}
                    isDarkMode={isDarkMode}
                />
                <SignupModal
                    isOpen={isSignupModalOpen}
                    onClose={() => setIsSignupModalOpen(false)}
                    onSwitchToLogin={() => {
                        setIsLoginModalOpen(false);
                        setIsSignupModalOpen(true);
                    }}
                    isDarkMode={isDarkMode}
                />
            </div>
        </div>
    );
};