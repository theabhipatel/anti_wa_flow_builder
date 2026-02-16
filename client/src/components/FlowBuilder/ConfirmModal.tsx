import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Focus cancel button on open & handle Escape key
    useEffect(() => {
        if (isOpen) {
            cancelRef.current?.focus();
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onCancel();
            };
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 w-full max-w-md mx-4 animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 p-6 pb-2">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDanger
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                            isDanger ? 'text-red-500' : 'text-amber-500'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                            {title}
                        </h3>
                        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors flex-shrink-0 -mt-1 -mr-1"
                    >
                        <X className="w-4 h-4 text-surface-400" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-100 dark:border-surface-700/50">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-surface-700 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-600 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
                            isDanger
                                ? 'bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20'
                                : 'bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
