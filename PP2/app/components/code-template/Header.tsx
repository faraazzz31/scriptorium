import { UserData } from '@/app/components/auth/types';
import { Clock, Users, Edit2, Check, X, Trash2, GitFork } from 'lucide-react';
import Link from 'next/link';

interface Template {
    id: number;
    title: string;
    explanation: string;
    code: string;
    language: string;
    createdAt: string;
    authorId: number;
    tags: { id: number; name: string }[];
    forks?: { id: number; title: string; author: { firstName: string; lastName: string }; createdAt: string }[];
    forkOf?: { id: number; title: string; author: { firstName: string; lastName: string } };
}

interface HeaderProps {
    template: Template;
    user: UserData | null;
    isEditingMeta: boolean;
    isEditing: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    editedTitle: string;
    isDarkMode: boolean;
    availableTags: { id: number; name: string }[];
    selectedTags: { id: number; name: string }[];
    setEditedTitle: (title: string) => void;
    setSelectedTags: (tags: { id: number; name: string }[]) => void;
    setIsEditing: (isEditing: boolean) => void;
    setIsEditingMeta: (isEditing: boolean) => void;
    handleSave: () => void;
    handleDelete: () => void;
    handleFork: () => void;
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
    isDarkMode,
    setEditedTitle,
    setIsEditing,
    setIsEditingMeta,
    handleSave,
    handleDelete,
    handleFork,
    handleTagSelect,
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

    return (
        <div className={`rounded-lg p-4 md:p-6 transition-colors duration-200 ${containerStyles}`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-4 flex-1">
                    {isEditingMeta ? (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className={`text-xl md:text-2xl font-bold w-full px-3 py-2 rounded-md border
                                        focus:outline-none focus:ring-2 focus:border-transparent
                                        transition-colors duration-200 ${inputStyles}`}
                            placeholder="Enter title..."
                        />
                    ) : (
                        <h1 className={`text-xl md:text-2xl font-bold ${titleStyles}`}>
                            {template.title}
                        </h1>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <div className={`flex items-center text-sm ${textStyles}`}>
                            <Clock className={`w-4 h-4 mr-1 ${secondaryTextStyles}`} />
                            <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center text-sm ${textStyles}`}>
                            <Users className={`w-4 h-4 mr-1 ${secondaryTextStyles}`} />
                            <span>{template.forks?.length || 0} forks</span>
                        </div>
                    </div>

                    {template.forkOf && (
                        <div className={`text-sm ${textStyles}`}>
                            Forked from{' '}
                            <Link
                                href={`/templates/${template.forkOf.id}`}
                                className={`${linkStyles} hover:underline`}
                            >
                                {template.forkOf.title}
                            </Link>
                            <span className={secondaryTextStyles}>
                                {' '}by {template.forkOf.author.firstName} {template.forkOf.author.lastName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {user?.id === template.authorId ? (
                        <>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={getButtonStyles('primary')}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                {isEditing ? 'View Mode' : 'Edit Mode'}
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
                                        className={getButtonStyles('danger')}
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
                            onClick={handleFork}
                            className={isDarkMode
                                ? "flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700"
                                : "flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-md text-white bg-purple-500 hover:bg-purple-600"
                            }
                        >
                            <GitFork className="w-4 h-4 mr-2" />
                            Fork Template
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};