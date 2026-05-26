import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ToastCtx = createContext(null);

let _nextId = 1;

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const STYLES = {
  success: "bg-teal-50 border-teal-200 text-teal-800",
  error: "bg-rose-50 border-rose-200 text-rose-800",
  info: "bg-slate-50 border-slate-200 text-slate-800",
};

function Toast({ id, message, type, onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timerRef.current);
  }, [id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 shadow-md text-sm max-w-sm w-full ${STYLES[type]}`}
      role="alert"
    >
      {ICONS[type]}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        className="ml-1 opacity-60 hover:opacity-100 transition"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = "info") => {
    const id = _nextId++;
    setToasts((t) => [...t, { id, message, type }]);
  }, []);

  const toast = useMemo(
    () => ({
      success: (msg) => push(msg, "success"),
      error: (msg) => push(msg, "error"),
      info: (msg) => push(msg, "info"),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* Fixed portal at top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-hooks/exhaustive-deps
const { useMemo } = React;

export function useToast() {
  return useContext(ToastCtx);
}
