import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, fireEvent, cleanup } from "@testing-library/react";
import RealtimeProvider, { useRealtime } from "@/components/shared/RealtimeProvider";

// Mock EventSource
interface MockEventSourceInstance {
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: (() => void) | null;
  close: () => void;
  url: string;
}

let activeInstance: MockEventSourceInstance | null = null;

class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor(public url: string) {
    activeInstance = [this][0];
  }
}

vi.stubGlobal("EventSource", MockEventSource);

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "new_proposal_msg" && params) {
        return `New proposal msg: ${params.label} - ${params.type}`;
      }
      if (key === "proposal_status_msg" && params) {
        return `Proposal status msg: ${params.action}`;
      }
      return key;
    },
  }),
}));

// Test helper component to consume hook
function Consumer({ onRender }: { onRender: (context: ReturnType<typeof useRealtime>) => void }) {
  const context = useRealtime();
  onRender(context);
  return <div>Pending: {context.pendingCount}</div>;
}

describe("components/shared/RealtimeProvider", () => {
  beforeEach(() => {
    cleanup();
    activeInstance = null;
    vi.useFakeTimers();
  });

  it("should throw error if useRealtime is used outside Provider", () => {
    expect(() => {
      render(<Consumer onRender={() => {}} />);
    }).toThrow("useRealtime must be used within a RealtimeProvider");
  });

  it("should render children and connect to EventSource", () => {
    render(
      <RealtimeProvider>
        <div>Child Content</div>
      </RealtimeProvider>
    );

    expect(screen.getByText("Child Content")).toBeDefined();
    expect(activeInstance).not.toBeNull();
    expect(activeInstance?.url).toBe("/api/updates");
  });

  it("should update pendingCount and show toast on message: proposal:created", () => {
    let capturedContext: ReturnType<typeof useRealtime> | undefined;

    render(
      <RealtimeProvider>
        <Consumer onRender={(c) => { capturedContext = c; }} />
      </RealtimeProvider>
    );

    expect(capturedContext?.pendingCount).toBe(0);

    // Simulate SSE message
    act(() => {
      activeInstance?.onmessage?.({
        data: JSON.stringify({
          pendingCount: 3,
          type: "proposal:created",
          proposal: { label: "Test Proposal", type: "add" },
        }),
      } as MessageEvent);
    });

    expect(capturedContext?.pendingCount).toBe(3);
    expect(screen.getByText("new_proposal_title")).toBeDefined();
    expect(screen.getByText("New proposal msg: Test Proposal - add")).toBeDefined();

    // Click close toast
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("new_proposal_title")).toBeNull();
  });

  it("should update pendingCount and show toast on message: proposal:updated", () => {
    render(
      <RealtimeProvider>
        <div>Child</div>
      </RealtimeProvider>
    );

    act(() => {
      activeInstance?.onmessage?.({
        data: JSON.stringify({
          pendingCount: 1,
          type: "proposal:updated",
          action: "merged",
        }),
      } as MessageEvent);
    });

    expect(screen.getByText("proposal_status_title")).toBeDefined();
    expect(screen.getByText("Proposal status msg: merged")).toBeDefined();
  });

  it("should attempt reconnect on error", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <RealtimeProvider>
        <div>Child</div>
      </RealtimeProvider>
    );

    const firstInstance = activeInstance;
    expect(firstInstance).not.toBeNull();

    act(() => {
      firstInstance?.onerror?.();
    });

    expect(firstInstance?.close).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    // Fast forward reconnect timer (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // A new instance should be created
    expect(activeInstance).not.toBeNull();
    expect(activeInstance).not.toBe(firstInstance);
    consoleWarnSpy.mockRestore();
  });

  it("should support subscribing to updates, triggering refresh, and auto-dismiss toasts", () => {
    let capturedContext: ReturnType<typeof useRealtime> | undefined;
    render(
      <RealtimeProvider>
        <Consumer onRender={(c) => { capturedContext = c; }} />
      </RealtimeProvider>
    );

    const mockCallback = vi.fn();
    let unsubscribe: (() => void) | undefined;
    act(() => {
      unsubscribe = capturedContext?.subscribeToUpdates(mockCallback);
    });

    act(() => {
      capturedContext?.triggerRefresh();
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    act(() => {
      unsubscribe?.();
    });
    act(() => {
      capturedContext?.triggerRefresh();
    });
    expect(mockCallback).toHaveBeenCalledTimes(1); // Should not increase

    // Trigger toast and check auto-dismiss
    act(() => {
      activeInstance?.onmessage?.({
        data: JSON.stringify({
          pendingCount: 1,
          type: "proposal:updated",
          action: "merged",
        }),
      } as MessageEvent);
    });
    expect(screen.getByText("proposal_status_title")).toBeDefined();

    // Fast-forward 6s (default duration)
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByText("proposal_status_title")).toBeNull();
  });
});
