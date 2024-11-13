"use client";

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Play } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { useTheme } from '@/app/components/theme/ThemeContext';
import SaveCodeTemplate from './components/code-template/SaveCodeTemplate';
import { LoginModal } from './components/auth/LoginModal';
import { SignupModal } from './components/auth/SignupModal';

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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);

  const { isDarkMode, toggleDarkMode } = useTheme();

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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Navigation Bar */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
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
                className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center h-[35px]"
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
              <Play size={20} className="mr-2" />
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
  
      {/* Save Code Template Dialog */}
      <SaveCodeTemplate
        code={code}
        language={language}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSwitchToLogin={() => setIsLoginModalOpen(true)}
      />
      {/* Login Modal */}
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
  );
}