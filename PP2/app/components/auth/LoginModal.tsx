'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from './AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
    isDarkMode: boolean;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToSignup, isDarkMode }: LoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            if (result.success) {
                onClose();
                setEmail('');
                setPassword('');
            } else {
                setError(result.error || 'Login failed');
            }
            } catch (error) {
                console.log(error)
                setError('An error occurred during login');
            } finally {
                setLoading(false);
            }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isDarkMode={isDarkMode}>
            <div className="p-6">
                {/* Login form */}
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Login
                </h2>

                {/* Error message */}
                {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    {/* Added email field*/}
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-1 block w-full rounded-md px-3 py-2 border
                            ${isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                    />
                </div>

                <div>
                    {/* Added password field*/}
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Password
                    </label>
                    <div className="relative mt-1">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                </div>
                
                {/* Login button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white bg-blue-500 hover:bg-blue-600
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                </form>
                
                {/* Signup link */}
                <div className="mt-4 text-center">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Do not have an account?{' '}
                    <button
                    onClick={() => {
                        onClose();
                        onSwitchToSignup();
                    }}
                    className="text-blue-500 hover:text-blue-600"
                    >
                    Sign up
                    </button>
                </p>
                </div>
            </div>
        </Modal>
    );
};