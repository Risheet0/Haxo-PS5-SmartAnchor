import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Sparkles
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    ai: (msg, duration) => addToast(msg, 'ai', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Fixed Toast Stacking Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => {
          let styles = 'bg-white border-slate-200 text-slate-900';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;

          if (t.type === 'success') {
            styles = 'bg-white border-emerald-200 text-emerald-950 shadow-sm';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
          } else if (t.type === 'error') {
            styles = 'bg-white border-red-200 text-red-950 shadow-sm';
            icon = <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
          } else if (t.type === 'warning') {
            styles = 'bg-white border-amber-200 text-amber-950 shadow-sm';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
          } else if (t.type === 'ai') {
            styles = 'bg-white border-indigo-200 text-indigo-950 shadow-sm';
            icon = <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />;
          } else if (t.type === 'info') {
            styles = 'bg-white border-blue-200 text-blue-950 shadow-sm';
            icon = <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between gap-3 text-xs font-semibold animate-fade-in pointer-events-auto ${styles}`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span className="leading-snug">{t.message}</span>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      success: (msg) => console.log('[Toast Success]', msg),
      error: (msg) => console.error('[Toast Error]', msg),
      warning: (msg) => console.warn('[Toast Warning]', msg),
      info: (msg) => console.log('[Toast Info]', msg),
      ai: (msg) => console.log('[Toast AI]', msg)
    };
  }
  return context;
}
