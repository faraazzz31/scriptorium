'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogIn, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { LoginModal } from '@/app/components/auth/LoginModal';
import { SignupModal } from '@/app/components/auth/SignupModal';

interface NavbarProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    const handleLoginClick = () => {
        setIsMenuOpen(false); // Close mobile menu if open
        setShowLoginModal(true);
    };

    const handleModalClose = () => {
        setShowLoginModal(false);
        setShowSignupModal(false);
    };

    return (
        <>
            {/* Modals - Moved outside the nav element */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={handleModalClose}
                onSwitchToSignup={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                }}
                isDarkMode={isDarkMode}
            />

            <SignupModal
                isOpen={showSignupModal}
                onClose={handleModalClose}
                onSwitchToLogin={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                }}
                isDarkMode={isDarkMode}
            />

        {/* Spacer div to prevent content from going under navbar */}
        <div className="h-16"></div>

        <nav className={`fixed top-0 w-full z-50 border-b backdrop-blur-sm transition-colors duration-200 font-sans
            ${isDarkMode ? 'border-gray-700/50 bg-gray-900/90' : 'border-gray-200/70 bg-white/90'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3">
                        <Image
                            src="/favicon.ico"
                            alt="Scriptorium Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8 transform hover:scale-105 transition-transform duration-200"
                        />
                        <span className={`text-2xl font-semibold tracking-tight bg-clip-text whitespace-nowrap
                            ${isDarkMode 
                                ? 'text-white' 
                                : 'text-gray-900'}`}>
                            Scriptorium
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center flex-1 ml-8">
                        <div className="flex space-x-1">
                            <Link 
                                href="/" 
                                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                                    ${pathname === '/' 
                                        ? isDarkMode 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-900'
                                        : isDarkMode 
                                            ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                                    }`}>
                                Code Editor
                            </Link>
                            <Link 
                                href="/blog" 
                                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                                    ${pathname.startsWith('/blog')
                                        ? isDarkMode 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-900'
                                        : isDarkMode 
                                            ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                                    }`}>
                                Blog Posts
                            </Link>
                            <Link 
                                href="/code-templates" 
                                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                                    ${pathname.startsWith('/code-template')
                                        ? isDarkMode 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-900'
                                        : isDarkMode 
                                            ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                                    }`}>
                                Code Templates
                            </Link>
                            {user && isAdmin && (
                                <Link 
                                    href="/reports" 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200
                                        ${pathname.startsWith('/reports')
                                            ? isDarkMode 
                                                ? 'bg-gray-800 text-white' 
                                                : 'bg-gray-100 text-gray-900'
                                            : isDarkMode 
                                                ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                                        }`}>
                                    Reports
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side items */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200
                                        ${isDarkMode 
                                            ? 'hover:bg-gray-800/80 text-gray-200' 
                                            : 'hover:bg-gray-100 text-gray-900'}`}
                                >
                                    {user.avatar ? (
                                        <Image
                                            src={user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}
                                            width={32}
                                            height={32}
                                            alt="Profile"
                                            className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all duration-200
                                                ${isDarkMode 
                                                    ? 'ring-blue-400/50 ring-offset-gray-900' 
                                                    : 'ring-gray-200 ring-offset-white'}`}
                                        />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all duration-200
                                            ${isDarkMode 
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900' 
                                                : 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-blue-200 ring-offset-2 ring-offset-white'}`}>
                                            {user.firstName[0]}
                                        </div>
                                    )}
                                    <span className={`font-medium tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {user.firstName}
                                    </span>
                                </button>

                                {showProfileMenu && (
                                    <div className={`absolute right-0 mt-2 w-48 rounded-lg transform transition-all duration-200 
                                        ${isDarkMode 
                                            ? 'bg-gray-900 border border-gray-700/50 shadow-xl shadow-black/20' 
                                            : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/20'}`}
                                    >
                                        <div className="py-1 rounded-lg overflow-hidden">
                                            <Link
                                                href="/profile"
                                                className={`block px-4 py-2 text-sm transition-all duration-200 font-medium tracking-wide
                                                    ${isDarkMode 
                                                        ? 'text-gray-200 hover:bg-gray-800/80 active:bg-gray-800' 
                                                        : 'text-gray-700 hover:bg-gray-100'}`}
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span>Your Profile</span>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowProfileMenu(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 font-medium tracking-wide
                                                    ${isDarkMode 
                                                        ? 'text-gray-200 hover:bg-gray-800/80 active:bg-gray-800' 
                                                        : 'text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <span>Sign out</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium tracking-wide
                                        transition-all duration-200 
                                        ${isDarkMode
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'}`}
                            >
                                <LogIn size={18}/>
                                <span>Login</span>
                            </button>
                        )}

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105
                                ${isDarkMode
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-300 hover:to-orange-300'
                                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'}`}
                        >
                            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 rounded-lg transition-all duration-200
                                ${isDarkMode 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                    : 'text-gray-700 hover:text-black hover:bg-gray-100'}`}
                        >
                            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className={`px-4 pt-2 pb-3 space-y-1 shadow-lg
                        ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        <Link 
                            href="/"
                            className={`block px-4 py-2 rounded-lg text-base font-medium tracking-wide transition-all duration-200
                                ${pathname === '/'
                                    ? isDarkMode 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-100 text-gray-900'
                                    : isDarkMode 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}>
                            Code Editor
                        </Link>
                        <Link 
                            href="/blog"
                            className={`block px-4 py-2 rounded-lg text-base font-medium tracking-wide transition-all duration-200
                                ${pathname.startsWith('/blog')
                                    ? isDarkMode 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-100 text-gray-900'
                                    : isDarkMode 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}>
                            Blog Posts
                        </Link>
                        <Link 
                            href="/code-templates"
                            className={`block px-4 py-2 rounded-lg text-base font-medium tracking-wide transition-all duration-200
                                ${pathname.startsWith('/code-template')
                                    ? isDarkMode 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-100 text-gray-900'
                                    : isDarkMode 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}>
                            Code Templates
                        </Link>
                        {user && isAdmin && (
                            <Link 
                                href="/reports"
                                className={`block px-4 py-2 rounded-lg text-base font-medium tracking-wide transition-all duration-200
                                    ${pathname.startsWith('/reports')
                                        ? isDarkMode 
                                            ? 'bg-gray-800 text-white' 
                                            : 'bg-gray-100 text-gray-900'
                                        : isDarkMode 
                                            ? 'text-gray-300 hover:text-white hover:bg-gray-800/80' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}>
                                Reports
                            </Link>
                        )}
                    </div>

                    {/* Divider */}
                    <div className={`my-3 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}></div>

                    {/* User Profile or Login Button */}
                    {user ? (
                        <div className="px-4">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200
                                    ${isDarkMode 
                                        ? 'hover:bg-gray-800/80 text-gray-200' 
                                        : 'hover:bg-gray-100 text-gray-900'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    {user.avatar ? (
                                        <Image
                                            src={user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`}
                                            width={32}
                                            height={32}
                                            alt="Profile"
                                            className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all duration-200
                                                ${isDarkMode 
                                                    ? 'ring-blue-400/50 ring-offset-gray-900' 
                                                    : 'ring-gray-200 ring-offset-white'}`}
                                        />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium
                                            ${isDarkMode 
                                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900' 
                                                : 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-2 ring-gray-200 ring-offset-2 ring-offset-white'}`}>
                                            {user.firstName[0]}
                                        </div>
                                    )}
                                    <span className="font-medium">{user.firstName}</span>
                                </div>
                            </button>

                            {/* Profile Menu */}
                            {showProfileMenu && (
                                <div className="mt-2 space-y-1">
                                    <Link
                                        href="/profile"
                                        className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium
                                            ${isDarkMode 
                                                ? 'text-gray-200 hover:bg-gray-800/80' 
                                                : 'text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Your Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowProfileMenu(false);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium
                                            ${isDarkMode 
                                                ? 'text-gray-200 hover:bg-gray-800/80' 
                                                : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="px-4">
                            <button
                                onClick={handleLoginClick}
                                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200 
                                    ${isDarkMode
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800'}`}
                            >
                                <LogIn size={18}/>
                                <span>Login</span>
                            </button>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <div className="px-4">
                        <button
                            onClick={() => {
                                toggleDarkMode();
                                setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200 
                                ${isDarkMode
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-300 hover:to-orange-300'
                                    : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'}`}
                        >
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                        </button>
                    </div>
                </div>
            )}
        </nav>
        </>
    );
};

export default Navbar;