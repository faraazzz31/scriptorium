'use client';

import { useAuth } from  '@/app/components/auth/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { avatarConfig } from '@/app/config/avatar';
import Navbar from '@/app/Navbar';
import { useTheme } from '@/app/components/theme/ThemeContext';

export default function ProfilePage() {
    const { user, loading, refetchUser } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        avatar: '',
    });
    const { isDarkMode, toggleDarkMode } = useTheme();

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone || '',
                avatar: user.avatar,
            });
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    avatar: formData.avatar,
                })
            });

            const data = await response.json();

            if (response.ok) {
                await refetchUser();
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            setError('An error occurred while updating profile');
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Navigation bar */}
            <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

            <div className="container mx-auto px-4 py-8">
                <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Profile Settings</h1>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Profile Picture</label>
                                <div className="grid grid-cols-6 gap-4">
                                    {avatarConfig.getValidPaths().map((path) => (
                                        <div
                                            key={path}
                                            onClick={() => setFormData({ ...formData, avatar: path })}
                                            className={`
                                                relative
                                                cursor-pointer
                                                rounded-full
                                                w-12 h-12
                                                transition-all duration-200
                                                ${formData.avatar === path 
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
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className={`w-full p-2 rounded border ${
                                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className={`w-full p-2 rounded border ${
                                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className={`w-full p-2 rounded border bg-gray-100 ${
                                        isDarkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-500'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full p-2 rounded border ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className={`px-4 py-2 rounded ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600' 
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Profile View Mode
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-20 h-20">
                                    <Image
                                        src={user.avatar || avatarConfig.getDefaultPath()}
                                        alt="Profile"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Phone</h3>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {user.phone || 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Account Type</h3>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}