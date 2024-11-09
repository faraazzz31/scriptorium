"use client";

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Moon, Sun, Play } from 'lucide-react';

const defaultCode = {
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

export default function Home() {
  const [code, setCode] = useState(defaultCode.java);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('java');
  const [isRunning, setIsRunning] = useState(false);
  const [input, setInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const runCode = async () => {
    setOutput('Running...');
    setIsRunning(true);

    try {
      const apiEndpoint = `/api/run-${language}`;
      const response = await fetch(apiEndpoint, {
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
    } catch (error) {
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
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Scriptorium</h1>
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'}`}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
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
      </div>
  );
}