import Link from 'next/link';
import { GitFork, Clock } from 'lucide-react';

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
}

export const ForksList = ({ forks, isDarkMode }: ForksListProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <GitFork className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold dark:text-white">
                    Forks ({forks.length})
                </h2>
            </div>

            <div className="space-y-4">
                {forks.map((fork) => (
                    <div
                        key={fork.id}
                        className="group flex flex-col md:flex-row md:items-center md:justify-between
                                    p-4 rounded-lg border dark:border-gray-700
                                    hover:border-blue-500 dark:hover:border-blue-500
                                    transition-colors duration-200"
                    >
                        <div className="space-y-2 md:space-y-1">
                            <Link
                                href={`/templates/${fork.id}`}
                                className="text-lg font-medium text-blue-500 hover:text-blue-600
                                            dark:text-blue-400 dark:hover:text-blue-300
                                            transition-colors duration-200"
                            >
                                {fork.title}
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                            href={`/templates/${fork.id}`}
                            className="hidden md:flex items-center gap-2 px-4 py-2 mt-4 md:mt-0
                                        text-sm font-medium text-gray-600 dark:text-gray-300
                                        hover:text-blue-500 dark:hover:text-blue-400
                                        group-hover:translate-x-1 transition-all duration-200"
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

            {forks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No forks yet
                </div>
            )}
        </div>
    );
};