import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode: boolean;
}

export const DeleteConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    isDarkMode,
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`relative w-full max-w-md rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} overflow-hidden`}>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-semibold">Delete Template</h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Are you sure you want to delete this template? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                isDarkMode
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};