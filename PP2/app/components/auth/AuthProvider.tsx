'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserData } from './types';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/');
    }, [router]);

    const refreshAccessToken = useCallback(async (refreshToken: string) => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const { accessToken } = await response.json();
                localStorage.setItem('accessToken', accessToken);
                return accessToken;
            }
            return null;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }, []);

    const fetchUserData = useCallback(async (token: string, shouldAttemptRefresh = true) => {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return true;
            }

            if (response.status === 401 && shouldAttemptRefresh) {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        return fetchUserData(newAccessToken, false);
                    }
                }
                handleLogout();
            }
            return false;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return false;
        }
    }, [refreshAccessToken, handleLogout]);

    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await fetchUserData(accessToken);
            }
            setLoading(false);
        };

        initAuth();
    }, [fetchUserData]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                await fetchUserData(data.accessToken);
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (error) {
            console.log(error);
            return { success: false, error: 'Login failed' };
        }
    }, [fetchUserData]);

    const refetchUser = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
        await fetchUserData(accessToken);
        }
    }, [fetchUserData]);

    return (
        <AuthContext.Provider value={{
        user,
        login,
        logout: handleLogout,
        loading,
        refetchUser
        }}>
        {children}
        </AuthContext.Provider>
    );
};