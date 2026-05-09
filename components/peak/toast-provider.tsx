"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, AlertTriangle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

type ToastInput = {
  message: string;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
};

type ToastEntry = ToastInput & { id: number; kind: ToastKind };

type ToastApi = {
  success: (input: string | ToastInput) => void;
  error: (input: string | ToastInput) => void;
  info: (input: string | ToastInput) => void;
};

const ToastContext = React.createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback(
    (kind: ToastKind, input: string | ToastInput) => {
      const id = ++idRef.current;
      const entry: ToastEntry =
        typeof input === "string"
          ? { id, kind, message: input }
          : { id, kind, ...input };
      setToasts((prev) => [...prev, entry]);
    },
    [],
  );

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (i) => push("success", i),
      error: (i) => push("error", i),
      info: (i) => push("info", i),
    }),
    [push],
  );

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.durationMs ?? 4000}
            onOpenChange={(open) => !open && remove(t.id)}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface-container px-4 py-3 shadow-lift",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out",
              t.kind === "success" && "border-tertiary/50",
              t.kind === "error" && "border-destructive/60",
              t.kind === "info" && "border-outline-variant",
            )}
          >
            <Icon kind={t.kind} />
            <ToastPrimitive.Description className="flex-1 text-body-md text-foreground">
              {t.message}
            </ToastPrimitive.Description>
            {t.action && (
              <ToastPrimitive.Action
                asChild
                altText={t.action.label}
                onClick={(e) => {
                  e.preventDefault();
                  t.action!.onClick();
                  remove(t.id);
                }}
              >
                <button className="text-button-label uppercase tracking-widest text-primary">
                  {t.action.label}
                </button>
              </ToastPrimitive.Action>
            )}
            <ToastPrimitive.Close
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md flex-col-reverse gap-2 p-edge outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function Icon({ kind }: { kind: ToastKind }) {
  if (kind === "success")
    return <Check className="h-5 w-5 shrink-0 text-tertiary" aria-hidden />;
  if (kind === "error")
    return (
      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
    );
  return <Info className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />;
}
