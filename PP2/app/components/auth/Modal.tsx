'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    isDarkMode: boolean;
}

export const Modal = ({ isOpen, onClose, children, isDarkMode }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-md transform rounded-lg shadow-xl transition-all
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                onClick={onClose}
                className={`absolute right-4 top-4 p-1 rounded-full
                    ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                <X size={20} />
                </button>
                {children}
            </div>
            </div>
        </div>
    );
};