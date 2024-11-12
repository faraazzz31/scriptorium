"use client";

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Play } from 'lucide-react';
import Navbar from './Navbar';
import { useTheme } from './components/theme/ThemeContext';

interface Tag {
  id: string;
  name: string;
}

interface CodeMap {
  [key: string]: string;
}

const defaultCode: CodeMap = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  python: `print("Hello, World!")`,
  javascript: `console.log("Hello, World!");`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`
};

export default function Home(): JSX.Element {
  const [code, setCode] = useState<string>(defaultCode.java);
  const [output, setOutput] = useState<string>('');
  const [language, setLanguage] = useState<string>('java');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [templateExplanation, setTemplateExplanation] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const { isDarkMode, toggleDarkMode } = useTheme();

  // const [tags, setTags] = useState<Tag[]>([]);
  //
  // useEffect(() => {
  //   const fetchTags = async () => {
  //     try {
  //       const response = await fetch('/api/tag/fetch');
  //       const data = await response.json();
  //       setTags(data);
  //     } catch (error) {
  //       console.error('Error fetching tags:', error);
  //     }
  //   };
  //
  //   fetchTags();
  // }, []);

  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const runCode = async (): Promise<void> => {
    setOutput('Running...');
    setIsRunning(true);

    try {
      const apiEndpoint: string = `/api/run-${language}`;
      const response: Response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
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

  const languageDisplay: { [key: string]: string } = {
    'java': 'Java',
    'python': 'Python',
    'javascript': 'JavaScript',
    'c': 'C',
    'cpp': 'C++'
  };

  return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Navigation Bar */}
        <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

        {/* Main Content */}
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4"> {/* Modified this div */}
                <div className="flex items-center space-x-2"> {/* Wrapped language selector */}
                  <label className="font-semibold">Language:</label>
                  <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300'}`}
                  >
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>

                <button
                    onClick={() => setIsDialogOpen(true)}
                    className={`p-2 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center h-[35px]`}
                >
                  <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Template
                </button>
              </div>


              <CodeMirror
                  value={code}
                  height="400px"
                  theme={isDarkMode ? oneDark : undefined}
                  extensions={[getLanguageMode()]}
                  onChange={(value) => setCode(value)}
                  className="border rounded"
              />

              <div>
                <label className="block font-semibold mb-2">Input:</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input(s) in separate lines here..."
                    className={`w-full p-2 rounded h-24 ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-300'}`}
                />
              </div>

              <button
                  onClick={runCode}
                  disabled={isRunning}
                  className={`flex items-center justify-center w-full p-2 rounded font-semibold ${
                      isDarkMode
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Play size={20} className="mr-2"/>
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Output:</h2>
              <pre
                  className={`p-4 rounded-lg h-[calc(100vh-12rem)] overflow-auto ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-300'
                  }`}
              >
              {output}
            </pre>
            </div>
          </div>
        </div>

        {isDialogOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
              <div
                  className={`relative w-full max-w-3xl rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                {/* Header */}
                <div className="p-6 pb-0">
                  <h2 className="text-xl font-semibold">Save Code Template</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium block">
                      Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={templateTitle}
                        onChange={(e) => setTemplateTitle(e.target.value)}
                        className={`w-full p-2 rounded border ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                        }`}
                        placeholder="Enter template title"
                    />
                  </div>

                  {/* Explanation Textarea */}
                  <div className="space-y-2">
                    <label htmlFor="explanation" className="text-sm font-medium block">
                      Explanation
                    </label>
                    <textarea
                        id="explanation"
                        value={templateExplanation}
                        onChange={(e) => setTemplateExplanation(e.target.value)}
                        className={`w-full p-2 rounded border ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                        }`}
                        placeholder="Explain the purpose of this template"
                        rows={3}
                    />
                  </div>

                  {/* Tag Select */}
                  <div className="space-y-2">
                    <label htmlFor="tag" className="text-sm font-medium block">
                      Tag
                    </label>
                    <select
                        id="tag"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className={`w-full p-2 rounded border ${
                            isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                      <option value="">Select a tag</option>
                      {/*{tags.map((tag) => (*/}
                      {/*    <option key={tag.id} value={tag.id}>*/}
                      {/*      {tag.name}*/}
                      {/*    </option>*/}
                      {/*))}*/}
                    </select>
                  </div>

                  {/* Language Display */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Language
                    </label>
                    <div className={`p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      {languageDisplay[language]}
                    </div>
                  </div>

                  {/* Code Display */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">
                      Code
                    </label>
                    <div className="h-[300px] relative">
                      <CodeMirror
                          value={code}
                          height="100%"
                          theme={isDarkMode ? oneDark : undefined}
                          extensions={[getLanguageMode()]}
                          editable={false}
                          className="border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with buttons - fixed at bottom */}
                <div className="p-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setIsDialogOpen(false)}
                        className={`px-4 py-2 rounded ${
                            isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                      Cancel
                    </button>
                    <button
                        onClick={() => {
                          // Save logic will go here
                          setIsDialogOpen(false);
                        }}
                        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Close button */}
                <button
                    onClick={() => setIsDialogOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
        )}
      </div>
  );
}