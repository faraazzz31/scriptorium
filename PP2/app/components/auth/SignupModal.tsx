'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { avatarConfig } from '@/app/config/avatar';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
    isDarkMode: boolean;
}

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin, isDarkMode }: SignupModalProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        selectedAvatar: avatarConfig.getDefaultPath()
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                onClose();
                onSwitchToLogin();
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (error) {
            console.log(error);
            setError('An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode}>
            <div className="p-6">
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Create Account
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Added grid layout for first name and last name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {/* Added first name field */}
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                First Name
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={`mt-1 block w-full rounded-md px-3 py-2 border
                                    ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>

                        <div>
                             {/* Added last name field */}
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className={`mt-1 block w-full rounded-md px-3 py-2 border
                                    ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        {/* Added email field */}
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`mt-1 block w-full rounded-md px-3 py-2 border
                            ${isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'}`}
                            required
                        />
                    </div>

                    <div>
                        {/* Added phone number field */}
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`mt-1 block w-full rounded-md px-3 py-2 border
                            ${isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'}`}
                            required
                        />
                    </div>

                    <div>
                        {/* Password Field with Toggle */}
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Password
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`pr-10 mt-1 block w-full rounded-md px-3 py-2 border
                                    ${isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                            <button
                                type="button"
                                className={`absolute inset-y-0 right-0 pr-3 flex items-center
                                    ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} className="hover:text-gray-500" />
                                ) : (
                                    <Eye size={20} className="hover:text-gray-500" />
                                )}
                            </button>
                        </div>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Password must be at least 8 characters
                        </p>
                    </div>

                    <div>
                        { /* Avatar selection */}
                        <div className="flex justify-between items-center mb-2">
                            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                Choose Avatar
                            </label>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Click an avatar to select
                            </span>
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                            {avatarConfig.getValidPaths().map((path) => (
                                <div
                                    key={path}
                                    onClick={() => setFormData({ ...formData, selectedAvatar: path })}
                                    className={`
                                        relative
                                        cursor-pointer
                                        rounded-full
                                        w-12 h-12
                                        transition-all duration-200
                                        ${formData.selectedAvatar === path 
                                            ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 transform' 
                                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 hover:scale-105'}
                                    `}
                                >
                                    <Image
                                        src={path}
                                        alt="Avatar option"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                    {formData.selectedAvatar === path && (
                                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Show selected avatar preview */}
                        <div className="mt-4 flex items-center gap-3">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                Selected:
                            </span>
                            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500">
                                <Image
                                    src={formData.selectedAvatar}
                                    alt="Selected avatar"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white bg-blue-500 hover:bg-blue-600
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Already have an account?{' '}
                    <button
                        onClick={() => {
                        onClose();
                        onSwitchToLogin();
                        }}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        Log in
                    </button>
                    </p>
                </div>
            </div>
        </Modal>
    );
};