import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type ToastVariant = "default" | "destructive";

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
  className?: string;
  duration?: number;
};

const TOAST_LIMIT = 3;
const DEFAULT_DURATION = 4000;

type State = {
  toasts: ToasterToast[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "REMOVE_TOAST"; toastId: string };

const listeners = new Set<(state: State) => void>();
let memoryState: State = { toasts: [] };

function dispatch(action: ToastAction): void {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function reducer(state: State, action: ToastAction): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "REMOVE_TOAST":
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId)
      };
    default:
      return state;
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function scheduleRemoval(toast: ToasterToast): void {
  const duration = toast.duration ?? DEFAULT_DURATION;
  if (duration === Infinity) {
    return;
  }

  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", toastId: toast.id });
  }, duration);
}

function createToast(toast: Omit<ToasterToast, "id">): ToasterToast {
  const newToast: ToasterToast = {
    id: generateId(),
    ...toast
  };

  dispatch({ type: "ADD_TOAST", toast: newToast });
  scheduleRemoval(newToast);
  return newToast;
}

function useToastState() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, []);

  return { ...state, dismiss };
}

type ToastOptions = Omit<ToasterToast, "id">;

const toast = (options: ToastOptions): ToasterToast => createToast(options);

const ToastContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3", className)}
      {...props}
    />
  )
);
ToastContainer.displayName = "ToastContainer";

const Toaster = (): JSX.Element => {
  const { toasts, dismiss } = useToastState();

  if (toasts.length === 0) {
    return <ToastContainer aria-live="polite" aria-atomic="true" />;
  }

  return (
    <ToastContainer aria-live="polite" aria-atomic="true">
      {toasts.map(({ id, title, description, action, variant = "default", className }) => (
        <div
          key={id}
          className={cn(
            "relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-lg border p-4 shadow-lg",
            variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-slate-200 bg-white text-slate-900",
            className
          )}
          role="status"
        >
          <div className="flex-1 space-y-1">
            {title ? <p className="text-sm font-semibold">{title}</p> : null}
            {description ? <p className="text-sm text-slate-600">{description}</p> : null}
            {action}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismiss(id)}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </ToastContainer>
  );
};

export { Toaster, toast };
