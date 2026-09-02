import React, { createContext, useContext, useState, useCallback, useMemo, useRef, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string, action?: ToastItem['action']) => string;
    error: (message: string, title?: string, action?: ToastItem['action']) => string;
    warning: (message: string, title?: string, action?: ToastItem['action']) => string;
    info: (message: string, title?: string, action?: ToastItem['action']) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_THEMES: Record<
  ToastType,
  {
    icon: typeof Info;
    defaultTag: string;
    containerClass: string;
    iconCircleClass: string;
    tagClass: string;
    textClass: string;
    iconClass: string;
  }
> = {
  info: {
    icon: Info,
    defaultTag: 'HEADS UP',
    containerClass: 'bg-[#EBF7FD] border-[#BAE6FD] text-[#0C4A6E] shadow-xl shadow-sky-950/5',
    iconCircleClass: 'bg-[#D0EEFA] text-[#0284C7]',
    tagClass: 'bg-[#D0EEFA] text-[#0369A1]',
    textClass: 'text-[#0F172A]',
    iconClass: 'w-4 h-4',
  },
  success: {
    icon: CheckCircle2,
    defaultTag: 'SUCCESS',
    containerClass: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D] shadow-xl shadow-emerald-950/5',
    iconCircleClass: 'bg-[#DCFCE7] text-[#16A34A]',
    tagClass: 'bg-[#DCFCE7] text-[#15803D]',
    textClass: 'text-[#0F172A]',
    iconClass: 'w-4 h-4',
  },
  warning: {
    icon: AlertTriangle,
    defaultTag: 'ATTENTION',
    containerClass: 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F] shadow-xl shadow-amber-950/5',
    iconCircleClass: 'bg-[#FEF3C7] text-[#D97706]',
    tagClass: 'bg-[#FEF3C7] text-[#B45309]',
    textClass: 'text-[#0F172A]',
    iconClass: 'w-4 h-4',
  },
  error: {
    icon: AlertCircle,
    defaultTag: 'ERROR',
    containerClass: 'bg-[#FFF1F2] border-[#FECDD3] text-[#881337] shadow-xl shadow-rose-950/5',
    iconCircleClass: 'bg-[#FFE4E6] text-[#E11D48]',
    tagClass: 'bg-[#FFE4E6] text-[#BE123C]',
    textClass: 'text-[#0F172A]',
    iconClass: 'w-4 h-4',
  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: Omit<ToastItem, 'id'>): string => {
      const dedupeKey = `${options.type}::${options.message}`;
      const now = Date.now();
      const lastSeen = recentToastsRef.current.get(dedupeKey);

      // Deduplication: prevent identical toast popping up twice within 1500ms
      if (lastSeen && now - lastSeen < 1500) {
        return '';
      }
      recentToastsRef.current.set(dedupeKey, now);

      // Clean old keys from map periodically
      if (recentToastsRef.current.size > 20) {
        recentToastsRef.current.forEach((timestamp, key) => {
          if (now - timestamp > 5000) {
            recentToastsRef.current.delete(key);
          }
        });
      }

      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...options, id };

      // Keep at most 3 active toasts at a time
      setToasts((prev) => [...prev.slice(-2), newToast]);

      const duration = options.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = useMemo(
    () => ({
      success: (message: string, title?: string, action?: ToastItem['action']) =>
        showToast({ type: 'success', message, title, action }),
      error: (message: string, title?: string, action?: ToastItem['action']) =>
        showToast({ type: 'error', message, title, action }),
      warning: (message: string, title?: string, action?: ToastItem['action']) =>
        showToast({ type: 'warning', message, title, action }),
      info: (message: string, title?: string, action?: ToastItem['action']) =>
        showToast({ type: 'info', message, title, action }),
    }),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({ toasts, showToast, dismissToast, toast }),
    [toasts, showToast, dismissToast, toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Viewport (Top-Right Floating) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none transition-all">
        {toasts.map((t) => {
          const theme = TOAST_THEMES[t.type];
          const Icon = theme.icon;
          const displayTag = t.title ? t.title.toUpperCase() : theme.defaultTag;

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${theme.containerClass}`}
            >
              {/* Left Circular Icon Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${theme.iconCircleClass}`}
              >
                <Icon className={theme.iconClass} />
              </div>

              {/* Center Content Column */}
              <div className="flex-1 min-w-0 pr-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${theme.tagClass}`}
                >
                  {displayTag}
                </span>
                <p className={`text-sm font-bold tracking-tight mt-1 leading-snug ${theme.textClass}`}>
                  {t.message}
                </p>

                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-1.5 text-xs font-bold underline hover:no-underline block"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>

              {/* Right Close Button */}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
