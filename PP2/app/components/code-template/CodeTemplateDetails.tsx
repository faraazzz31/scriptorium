'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { useTheme } from '@/app/components/theme/ThemeContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/code-template/Header';
import { CodeEditor } from '@/app/components/code-template/CodeEditor';
import { InputOutput } from '@/app/components/code-template/InputOutput';
import { ForksList } from '@/app/components/code-template/ForksList';
import { DeleteConfirmationModal } from './DeleteConfirmation';

interface CodeTemplateDetailsProps {
    templateId: number;
}

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

interface KeyDownEvent extends React.KeyboardEvent {
    ctrlKey: boolean;
    metaKey: boolean;
    key: string;
}

const CodeTemplateDetails = ({ templateId }: CodeTemplateDetailsProps) => {
    const [template, setTemplate] = useState<Template | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCode, setEditedCode] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [editedExplanation, setEditedExplanation] = useState('');
    const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
    const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([])
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isEditingMeta, setIsEditingMeta] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [error, setError] = useState('');

    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            try {
                const response = await fetch(`/api/code-template/fetch?id=${templateId}`);
                if (!response.ok) {
                    setError('Failed to fetch template');
                }
                const { data } = await response.json();
                setTemplate(data);
                setEditedCode(data.code);
                setEditedTitle(data.title);
                setEditedExplanation(data.explanation);
                setSelectedTags(data.tags);
            } catch (error) {
                console.error('Error fetching template:', error);
                setError('Failed to fetch template');
            }
        };

        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tag/fetch');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableTags(data.tags);
                } else {
                    console.error('Failed to fetch tags:', await response.text());
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();

        if (templateId) {
            fetchTemplateDetails();
        }
    }, [templateId]);

    const runCode = async (): Promise<void> => {
        setOutput('Running...');
        setIsRunning(true);

        try {
            const apiEndpoint: string = `/api/run-${template?.language}`;
            const response: Response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: isEditing ? editedCode : template?.code,
                    input
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setOutput(data.output || 'No output');
            } else {
                setOutput(data.error || `Error: ${response.status} ${response.statusText}`);
            }
        } catch (error: any) {
            console.error('Error in runCode:', error);
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleTagSelect = (tag: { id: number; name: string }) => {
        if (selectedTags.some((t) => t.id === tag.id)) {
            setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleKeyDown = async (e: KeyDownEvent): Promise<void> => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
            e.preventDefault();
            await handleSave();
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/code-template/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    codeTemplateId: templateId,
                    title: editedTitle,
                    explanation: editedExplanation,
                    code: editedCode,
                    tag_ids: selectedTags.map((tag) => tag.id),
                }),
            });

            if (!response.ok) {
                setError('Failed to save changes');
            }

            const updatedTemplate = await response.json();
            setTemplate(updatedTemplate);
            setSaveMessage('Changes saved successfully!');
            setIsEditingMeta(false);
        } catch (error) {
            console.error('Error saving changes:', error);
            setSaveMessage('Failed to save changes');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleDelete = async () => {
        setIsDeleteModalOpen(true);
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleteModalOpen(false);
        setIsDeleting(true);
        try {
            const response = await fetch('/api/code-template/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    codeTemplateId: templateId,
                }),
            });

            if (!response.ok) {
                setError('Failed to delete template');
            }

            router.push('/code-templates'); // Redirect to templates list
        } catch (error) {
            console.error('Error deleting template:', error);
            setError('Failed to delete template');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!template) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}
            <div className="container mx-auto px-4 py-6 space-y-6">
                <Header
                    template={template}
                    user={user}
                    isEditingMeta={isEditingMeta}
                    isEditing={isEditing}
                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    editedTitle={editedTitle}
                    editedExplanation={editedExplanation}
                    setEditedTitle={setEditedTitle}
                    setEditedExplanation={setEditedExplanation}
                    setIsEditing={setIsEditing}
                    setIsEditingMeta={setIsEditingMeta}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                    isDarkMode={isDarkMode}
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    handleTagSelect={handleTagSelect}
                />

                <div className="space-y-6">
                    <CodeEditor
                        code={isEditing ? editedCode : template.code}
                        language={template.language}
                        isEditing={isEditing}
                        isDarkMode={isDarkMode}
                        isSaving={isSaving}
                        isRunning={isRunning}
                        saveMessage={saveMessage}
                        onCodeChange={setEditedCode}
                        onSave={handleSave}
                        onRun={runCode}
                        onKeyDown={handleKeyDown}
                    />

                    <InputOutput
                        input={input}
                        output={output}
                        isDarkMode={isDarkMode}
                        onInputChange={setInput}
                    />
                </div>

                {template.forks && template.forks.length > 0 && (
                    <ForksList forks={template.forks} isDarkMode={isDarkMode} />
                )}

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isDarkMode={isDarkMode}
                />
            </div>
        </div>
    );
};

export default CodeTemplateDetails;