"use client";

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { LogIn, Moon, Sun, Play, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'
import { LoginModal } from '@/app/components/auth/LoginModal';
import { SignupModal } from '@/app/components/auth/SignupModal';
import { useAuth } from '@/app/components/auth/AuthContext';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [templateTitle, setTemplateTitle] = useState<string>('');
  const [templateExplanation, setTemplateExplanation] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    const darkModePreference = localStorage.getItem('darkMode');
    setIsDarkMode(darkModePreference === 'true');
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

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
        <nav className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="w-full px-2"> {/* Modified this div */}
            <div className="flex items-center h-16">  {/* Removed justify-between */}
              {/* Logo and Brand */}
              <div className="flex items-center pl-0"> {/* Modified this div */}
                <Image
                    src="favicon.ico"
                    alt="Scriptorium Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
                <span className="text-2xl font-bold ml-2">Scriptorium</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1">
                <div className="flex space-x-8">
                  <Link href="/editor"
                        className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
                    Code Editor
                  </Link>
                  <Link href="/blog"
                        className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
                    Blog Posts
                  </Link>
                  <Link href="/templates"
                        className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
                    Code Templates
                  </Link>
                </div>
              </div>

               {/* Right side items */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // Profile Menu
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        width={32}
                        height={32}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user.firstName[0]}
                      </div>
                    )}
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div 
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg 
                        ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                        ring-1 ring-black ring-opacity-5`}
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className={`block px-4 py-2 text-sm ${
                            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Login Button
                <button
                  onClick={() => setShowLoginModal(true)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'
                }`}
              >
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
              <div className="md:hidden">
                <div className={`px-2 pt-2 pb-3 space-y-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <Link href="/editor"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                    Code Editor
                  </Link>
                  <Link href="/blog"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                    Blog Posts
                  </Link>
                  <Link href="/templates"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                    Code Templates
                  </Link>
                  <Link href="/login"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                    Login
                  </Link>
                  <div className="px-3 py-2">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'}`}
                    >
                      {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>
                  </div>
                </div>
              </div>
          )}
        </nav>

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

        {/* Login Modal (includes signup option) */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          isDarkMode={isDarkMode}
        />

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
          isDarkMode={isDarkMode}
        />
        
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