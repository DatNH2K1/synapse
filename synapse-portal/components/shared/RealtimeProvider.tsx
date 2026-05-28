"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Toast {
  id: string;
  type: "proposal:created" | "proposal:updated" | "info" | "success";
  title: string;
  message: string;
  duration?: number;
}

interface RealtimeContextType {
  pendingCount: number;
  triggerRefresh: () => void;
  subscribeToUpdates: (callback: () => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined,
);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

export default function RealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [subscribers, setSubscribers] = useState<(() => void)[]>([]);
  const { t } = useI18n();

  const triggerRefresh = useCallback(() => {
    subscribers.forEach((cb) => cb());
  }, [subscribers]);

  const subscribeToUpdates = useCallback((callback: () => void) => {
    setSubscribers((prev) => [...prev, callback]);
    return () => {
      setSubscribers((prev) => prev.filter((cb) => cb !== callback));
    };
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 6000;

    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      console.log("[Realtime] Connecting to updates stream...");
      eventSource = new EventSource("/api/updates");

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.pendingCount !== undefined) {
            setPendingCount(data.pendingCount);
          }

          if (data.type === "proposal:created") {
            addToast({
              type: "proposal:created",
              title: t("new_proposal_title"),
              message: t("new_proposal_msg", {
                label: data.proposal.label,
                type: data.proposal.type,
              }),
            });
            triggerRefresh();
          } else if (data.type === "proposal:updated") {
            addToast({
              type: "success",
              title: t("proposal_status_title"),
              message: t("proposal_status_msg", {
                action: data.action,
              }),
            });
            triggerRefresh();
          }
        } catch {
          // Keep-alive pings can be ignored
        }
      };

      eventSource.onerror = () => {
        console.warn(
          "[Realtime] Stream connection lost. Attempting to reconnect in 5s...",
        );
        eventSource?.close();
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [addToast, t, triggerRefresh]);

  return (
    <RealtimeContext.Provider
      value={{ pendingCount, triggerRefresh, subscribeToUpdates }}
    >
      {children}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-96 max-w-[calc(100vw-3rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="group relative flex overflow-hidden rounded-2xl border border-white/10 glass-dark p-4 shadow-2xl transition-all duration-300 animate-in slide-in-from-right-4 fade-in"
          >
            {/* Ambient Background Gradient Glow on hover */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-primary/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Decorative colored left border stripe */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                toast.type === "proposal:created"
                  ? "bg-accent-primary"
                  : "bg-emerald-500"
              }`}
            />

            <div className="flex gap-3 pl-2 w-full">
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === "proposal:created" ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 text-accent-primary">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-xs font-black tracking-wider uppercase text-dashboard-fg">
                  {toast.title}
                </h4>
                <p className="mt-1 text-xs font-medium text-slate-400 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-4 top-4 text-slate-500 hover:text-dashboard-fg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Animated linear progress indicator for auto-dismiss */}
            <div
              className={`absolute bottom-0 left-0 h-0.5 ${
                toast.type === "proposal:created"
                  ? "bg-accent-primary/30"
                  : "bg-emerald-500/30"
              }`}
              style={{
                width: "100%",
                animation: `shrinkWidth ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Dynamic Keyframe Injection for Progress Bar */}
      <style jsx global>{`
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </RealtimeContext.Provider>
  );
}
