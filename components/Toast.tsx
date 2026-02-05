import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    }[type];

    const icon = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    }[type];

    return (
        <div className="fixed top-24 right-4 z-[9999] animate-slide-in-right">
            <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
                <div className="text-xl font-bold">{icon}</div>
                <p className="flex-1 text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors ml-2"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;
