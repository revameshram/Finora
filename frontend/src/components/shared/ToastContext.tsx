import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
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

const TOAST_STYLES: Record<
  ToastType,
  { icon: typeof CheckCircle2; bg: string; border: string; iconColor: string; titleColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-white',
    border: 'border-l-4 border-l-[#B45309] border-[#E7E5E4]',
    iconColor: 'text-[#B45309]',
    titleColor: 'text-[#1C1917]',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-[#BE123C] border-[#E7E5E4]',
    iconColor: 'text-[#BE123C]',
    titleColor: 'text-[#1C1917]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-l-4 border-l-[#B45309] border-[#E7E5E4]',
    iconColor: 'text-[#B45309]',
    titleColor: 'text-[#1C1917]',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-l-4 border-l-[#1C1917] border-[#E7E5E4]',
    iconColor: 'text-[#1C1917]',
    titleColor: 'text-[#1C1917]',
  },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: Omit<ToastItem, 'id'>): string => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...options, id };

      // Keep at most 3 active toasts at any time to prevent flood
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
      {/* Toast Viewport */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type];
          const Icon = style.icon;

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all ${style.bg} ${style.border}`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && <h4 className={`text-xs font-bold ${style.titleColor}`}>{t.title}</h4>}
                <p className="text-xs text-[#78716C] leading-relaxed mt-0.5">{t.message}</p>
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-1.5 text-xs font-semibold text-[#1C1917] underline hover:no-underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-[#78716C]/60 hover:text-[#1C1917] p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="h-3.5 w-3.5" />
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
