import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

interface InputOutputProps {
    input: string;
    output: string;
    isDarkMode: boolean;
    onInputChange: (value: string) => void;
}

export const InputOutput = ({
    input,
    output,
    isDarkMode,
    onInputChange
}: InputOutputProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className={`
                rounded-xl shadow-lg overflow-hidden
                border transition-all duration-200 hover:shadow-xl
                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
                <div className={`
                    px-4 py-3 border-b flex items-center justify-between
                    ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}
                `}>
                    <div className="flex items-center gap-2">
                        <Code2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Input
                        </h2>
                    </div>
                </div>

                <div className="p-4">
                    <textarea
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        placeholder="Enter your input here..."
                        className={`
                            w-full p-3 rounded-lg h-[300px] font-mono text-sm
                            transition-colors duration-200 resize-none
                            border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                            ${isDarkMode 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}
                        `}
                        aria-label="Code input"
                        spellCheck="false"
                    />
                </div>
            </div>

            {/* Output Section */}
            <div className={`
                rounded-xl shadow-lg overflow-hidden
                border transition-all duration-200 hover:shadow-xl
                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
                <div className={`
                    px-4 py-3 border-b flex items-center justify-between
                    ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}
                `}>
                    <div className="flex items-center gap-2">
                        <Terminal className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Output
                        </h2>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`
                            p-1.5 rounded-md transition-all duration-200
                            ${isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}
                        `}
                        title="Copy to clipboard"
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <div className="relative">
                    <div className={`
                        absolute top-0 left-0 h-full border-r px-2 pt-4 text-right select-none
                        ${isDarkMode 
                            ? 'bg-gray-900/50 border-gray-700 text-gray-600' 
                            : 'bg-gray-50/50 border-gray-200 text-gray-400'}
                    `}
                        style={{ width: '3rem' }}
                    >
                        {output.split('\n').map((_, i) => (
                            <div key={i} className="leading-6 text-xs font-mono">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    
                    <pre
                        className={`
                            p-4 pl-12 min-h-[300px] max-h-[500px] overflow-auto
                            font-mono text-sm leading-6 transition-colors duration-200
                            ${isDarkMode 
                                ? 'bg-gray-900 text-gray-300' 
                                : 'bg-gray-50 text-gray-900'}
                        `}
                        role="log"
                        aria-label="Code output"
                    >
                        <code>
                            {output || 'No output yet...'}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default InputOutput;