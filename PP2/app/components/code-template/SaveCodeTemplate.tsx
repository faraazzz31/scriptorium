"use client";

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { X, Save, Tag } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

interface Tag {
    id: number;
    name: string;
}

interface SaveCodeTemplateProps {
    code: string;
    language: string;
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function SaveCodeTemplate({ code, language, isOpen, onClose, onSwitchToLogin  }: SaveCodeTemplateProps) {
    const [templateTitle, setTemplateTitle] = useState<string>('');
    const [templateExplanation, setTemplateExplanation] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const { isDarkMode } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setTemplateTitle('');
            setTemplateExplanation('');
            setSelectedTags([]);
            setSaveError(null);
            setSuccessMessage('');
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tag/fetch');
            if (response.ok) {
                const data = await response.json();
                setTags(data.tags);
            } else {
                console.error('Failed to fetch tags:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const getLanguageMode = () => {
        switch (language) {
            case 'python': return python();
            case 'javascript': return javascript();
            case 'java': return java();
            case 'c':
            case 'cpp': return cpp();
            default: return javascript();
        }
    };

    const handleSaveCodeTemplate = async () => {
        setIsSaving(true);
        setSaveError(null);
        setSuccessMessage('');

        try {
            if (!user) {
                setSaveError('You need to be logged in to save code templates.');
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setSaveError('You need to be logged in to save code templates.');
                return;
            }

            const response = await fetch('/api/code-template/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: templateTitle,
                    explanation: templateExplanation,
                    code,
                    language,
                    tag_ids: selectedTags.map((tag) => tag.id),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Template saved successfully!');
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setSaveError(data.error || 'Failed to save template');
                if (response.status === 401) {
                    setSaveError('You need to be logged in to save code templates.');
                }
            }
        } catch (error) {
            console.error('Error saving template:', error);
            setSaveError('An error occurred while saving the template');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTagSelect = (tag: Tag) => {
        if (selectedTags.some((t) => t.id === tag.id)) {
            setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSaveClick = () => {
        setSaveError(null);

        if (!templateTitle.trim()) {
            setSaveError('Please enter a title for the code template.');
            return;
        }

        if (!code.trim()) {
            setSaveError('Please provide the code for the template.');
            return;
        }

        if (!language) {
            setSaveError('Please select a language for the code template.');
            return;
        }

        if (!user) {
            setSaveError('You need to be logged in to save code templates.');
            return;
        }

        handleSaveCodeTemplate();
    };

    const handleClose = () => {
        setTemplateTitle('');
        setTemplateExplanation('');
        setSelectedTags([]);
        setSaveError(null);
        setSuccessMessage('');
        onClose();
    };

    const handleLoginRedirect = () => {
        onClose(); // Close the save template modal
        onSwitchToLogin(); // Open the login modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Save Code Template Modal */}
            <div className={`relative w-full max-w-4xl rounded-xl shadow-2xl ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'} overflow-hidden`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Save className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-semibold">Save Code Template</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {saveError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {saveError}
                            {!user && (
                                <button
                                    onClick={() => handleLoginRedirect()}
                                    className="mt-2 w-full py-2 px-4 rounded-md text-white bg-red-500 hover:bg-red-600"
                                >
                                    Login to Save Templates
                                </button>
                            )}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={templateTitle}
                                onChange={(e) => setTemplateTitle(e.target.value)}
                                className={`mt-1 block w-full rounded-md px-3 py-2 border ${
                                    isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Enter a descriptive title for your template"
                            />
                        </div>

                        {/* Explanation Textarea */}
                        <div>
                            <label htmlFor="explanation" className="block text-sm font-medium mb-2">
                                Explanation (optional)
                            </label>
                            <textarea
                                id="explanation"
                                value={templateExplanation}
                                onChange={(e) => setTemplateExplanation(e.target.value)}
                                className={`mt-1 block w-full rounded-md px-3 py-2 border ${
                                    isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Explain the purpose and usage of this template"
                                rows={3}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">
                                    Tags
                                </label>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Click to select multiple tags
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagSelect(tag)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                            ${selectedTags.some((t) => t.id === tag.id)
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                                : isDarkMode
                                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code Preview with updated language badge */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">
                                    Code Preview
                                </label>
                                <span className="px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-500">
                                    {language.toUpperCase()}
                                </span>
                            </div>
                            <div className="rounded-lg overflow-hidden border dark:border-gray-700">
                                <CodeMirror
                                    value={code}
                                    height="200px"
                                    theme={isDarkMode ? oneDark : undefined}
                                    extensions={[getLanguageMode()]}
                                    editable={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                isDarkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600
                                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}