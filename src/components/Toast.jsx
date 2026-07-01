import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: {
    icon: CheckCircle2,
    border: "border-[#00D4AA]",
    iconColor: "text-[#00D4AA]",
    bg: "bg-[#00D4AA]/10",
    progressColor: "bg-[#00D4AA]",
    label: "Éxito",
  },
  error: {
    icon: XCircle,
    border: "border-red-500",
    iconColor: "text-red-400",
    bg: "bg-red-500/10",
    progressColor: "bg-red-500",
    label: "Error",
  },
  info: {
    icon: Info,
    border: "border-[#6C63FF]",
    iconColor: "text-[#6C63FF]",
    bg: "bg-[#6C63FF]/10",
    progressColor: "bg-[#6C63FF]",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-400",
    iconColor: "text-amber-400",
    bg: "bg-amber-400/10",
    progressColor: "bg-amber-400",
    label: "Advertencia",
  },
};

const AUTO_DISMISS_MS = 4000;
const MAX_TOASTS = 3;

let toastIdCounter = 0;

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingRef = useRef(AUTO_DISMISS_MS);
  const pausedRef = useRef(false);

  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  const startDismissTimer = useCallback(() => {
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const totalElapsed =
        AUTO_DISMISS_MS - remainingRef.current + elapsed;
      const pct = Math.max(
        0,
        100 - (totalElapsed / AUTO_DISMISS_MS) * 100
      );
      setProgress(pct);
    }, 30);

    timeoutRef.current = setTimeout(() => {
      triggerLeave();
    }, remainingRef.current);
  }, []);

  const triggerLeave = useCallback(() => {
    setLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 350);
  }, [toast.id, onRemove]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    startDismissTimer();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    pausedRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(
      0,
      remainingRef.current - elapsed
    );
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
    startTimeRef.current = Date.now();
    startDismissTimer();
  };

  const handleClose = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    triggerLeave();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transition:
          "opacity 350ms cubic-bezier(0.4,0,0.2,1), transform 350ms cubic-bezier(0.4,0,0.2,1)",
        opacity: visible && !leaving ? 1 : 0,
        transform:
          visible && !leaving
            ? "translateX(0) scale(1)"
            : "translateX(100%) scale(0.95)",
        willChange: "opacity, transform",
      }}
      className={`
        relative w-full max-w-sm pointer-events-auto
        rounded-xl border ${config.border} ${config.bg}
        bg-[#1A1A2E] shadow-2xl shadow-black/60
        overflow-hidden
      `}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-9 h-9 rounded-lg
            flex items-center justify-center
            ${config.bg} border ${config.border}
          `}
        >
          <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${config.iconColor}`}
          >
            {config.label}
          </p>
          {toast.title && (
            <p className="text-sm font-semibold text-white leading-snug mb-0.5 truncate">
              {toast.title}
            </p>
          )}
          {toast.message && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="
            flex-shrink-0 w-7 h-7 rounded-lg
            flex items-center justify-center
            text-gray-500 hover:text-white
            hover:bg-white/10
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-white/20
          "
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          className={`h-full ${config.progressColor} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title = "", message = "" }) => {
      const id = ++toastIdCounter;
      setToasts((prev) => {
        const next = [...prev, { id, type, title, message }];
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });
      return id;
    },
    []
  );

  const toast = useCallback(
    (message, options = {}) => {
      if (typeof message === "object" && message !== null) {
        return addToast(message);
      }
      return addToast({ message, ...options });
    },
    [addToast]
  );

  toast.success = useCallback(
    (message, title) => addToast({ type: "success", message, title }),
    [addToast]
  );
  toast.error = useCallback(
    (message, title) => addToast({ type: "error", message, title }),
    [addToast]
  );
  toast.info = useCallback(
    (message, title) => addToast({ type: "info", message, title }),
    [addToast]
  );
  toast.warning = useCallback(
    (message, title) => addToast({ type: "warning", message, title }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="
          fixed bottom-4 right-4 z-[9999]
          flex flex-col gap-2.5
          items-end
          pointer-events-none
          w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm
        "
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

export default ToastProvider;