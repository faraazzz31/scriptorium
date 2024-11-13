import CodeMirror from '@uiw/react-codemirror';
import { Save, Play } from 'lucide-react';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';

interface KeyDownEvent extends React.KeyboardEvent {
    ctrlKey: boolean;
    metaKey: boolean;
    key: string;
}

interface CodeEditorProps {
    code: string;
    language: string;
    isEditing: boolean;
    isDarkMode: boolean;
    isSaving: boolean;
    isRunning: boolean;
    saveMessage: string;
    onCodeChange: (value: string) => void;
    onSave: () => void;
    onRun: () => void;
    onKeyDown: (e: KeyDownEvent) => void;
}

export const CodeEditor = ({
    code,
    language,
    isEditing,
    isDarkMode,
    isSaving,
    isRunning,
    saveMessage,
    onCodeChange,
    onSave,
    onRun,
    onKeyDown
}: CodeEditorProps) => {
    const getLanguageMode = (language: string) => {
        switch (language) {
            case 'python': return python();
            case 'javascript': return javascript();
            case 'java': return java();
            case 'c':
            case 'cpp': return cpp();
            default: return javascript();
        }
    };

    return (
        <div className={`
            rounded-lg shadow-lg p-4 md:p-6
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        `}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <span className={`
                    px-3 py-1 text-sm font-medium rounded-md 
                    ${isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}
                `}>
                    {language.toUpperCase()}
                </span>

                <div className="flex gap-2">
                    {isEditing && (
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className={`
                                flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-md
                                ${isDarkMode
                                    ? 'bg-green-700 hover:bg-green-800 text-white disabled:opacity-50'
                                    : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50'
                                }
                            `}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className={`
                            flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-md
                            ${isDarkMode
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50'
                            }
                        `}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </div>

            {saveMessage && (
                <div className={`
                    mb-4 p-3 rounded
                    ${isDarkMode
                        ? 'bg-green-900 border border-green-700 text-green-300'
                        : 'bg-green-100 border border-green-400 text-green-700'
                    }
                `}>
                    {saveMessage}
                </div>
            )}

            <div className={`
                rounded-lg overflow-hidden border
                ${isDarkMode ? 'border-gray-700' : ''}
            `}>
                <CodeMirror
                    value={code}
                    height="400px"
                    theme={isDarkMode ? oneDark : undefined}
                    extensions={[getLanguageMode(language)]}
                    editable={isEditing}
                    onChange={onCodeChange}
                    onKeyDown={onKeyDown}
                    className="w-full"
                />
            </div>
        </div>
    );
};