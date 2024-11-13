'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { LoginModal } from '@/app/components/auth/LoginModal';
import { SignupModal } from '@/app/components/auth/SignupModal';

interface NavbarProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);


    return (
        <nav className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="w-full px-2"> {/* Modified this div */}
                <div className="flex items-center h-16">  {/* Removed justify-between */}
                    {/* Logo and Brand */}
                    <div className="flex items-center pl-0"> {/* Modified this div */}
                        <Image
                            src="/favicon.ico"
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
                            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
                                Code Editor
                            </Link>
                            <Link href="/blog" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
                                Blog Posts
                            </Link>
                            <Link href="/templates" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'} px-3 py-2 rounded-md text-sm font-medium`}>
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
                                    src={user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}
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

                            {/* Profile Menu */}
                            {showProfileMenu && (
                                <div
                                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg
                                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5`}
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
        </nav>
    );
};

export default Navbar;