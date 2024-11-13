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
    // Container styles
    const containerStyles = isDarkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200";

    // Label/Title styles
    const labelStyles = isDarkMode
        ? "text-white"
        : "text-gray-900";

    // Textarea styles
    const textareaStyles = isDarkMode
        ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-blue-500"
        : "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:border-blue-500";

    // Output pre styles
    const outputStyles = isDarkMode
        ? "bg-gray-900 text-gray-300 border-gray-700"
        : "bg-gray-50 text-gray-900 border-gray-300";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Section */}
            <div className={`rounded-lg shadow-lg p-4 md:p-6 transition-colors duration-200
                            border ${containerStyles}`}>
                <label className={`block font-semibold mb-2 ${labelStyles}`}>
                    Input:
                </label>
                <textarea
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder="Enter input(s) in separate lines here..."
                    className={`w-full p-2 rounded-md h-24 resize-none transition-colors duration-200
                                border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                ${textareaStyles}`}
                    aria-label="Code input"
                />
            </div>

            {/* Output Section */}
            <div className={`rounded-lg shadow-lg p-4 md:p-6 transition-colors duration-200
                            border ${containerStyles}`}>
                <h2 className={`font-semibold mb-2 ${labelStyles}`}>
                    Output:
                </h2>
                <pre
                    className={`p-4 rounded-lg h-[200px] md:h-[600px] overflow-auto
                                font-mono text-sm border transition-colors duration-200
                                ${outputStyles}`}
                    role="log"
                    aria-label="Code output"
                >
                    {output || 'No output yet'}
                </pre>
            </div>
        </div>
    );
};