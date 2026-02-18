import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────
type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
        warning: (message: string) => void;
    };
}

// ─── Context ────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx.toast;
}

// ─── Provider ───────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const addToast = useCallback((message: string, variant: ToastVariant) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, message, variant }]);
        const timer = setTimeout(() => removeToast(id), 4000);
        timersRef.current.set(id, timer);
    }, [removeToast]);

    const toast = {
        success: (msg: string) => addToast(msg, 'success'),
        error: (msg: string) => addToast(msg, 'error'),
        info: (msg: string) => addToast(msg, 'info'),
        warning: (msg: string) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Toast Item ─────────────────────────────────────────────────
const variantConfig: Record<ToastVariant, { icon: React.ElementType; bg: string; border: string; text: string }> = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-50 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-300',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
    },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = variantConfig[toast.variant];
    const Icon = config.icon;

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[280px] max-w-[400px] animate-slide-in-right ${config.bg} ${config.border}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${config.text}`} />
            <p className={`text-sm font-medium flex-1 ${config.text}`}>{toast.message}</p>
            <button
                onClick={onClose}
                className={`p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 ${config.text}`}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
