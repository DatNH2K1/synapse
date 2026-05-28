import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  eventBus,
  EVENTS,
  broadcastProposalCreated,
  broadcastProposalUpdated,
} from "@/lib/services/event-service";

describe("event-service Tests", () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it("should broadcast proposal:created event with correct payload", () => {
    const mockProposal = {
      id: "prop-123",
      label: "Test Proposal",
      type: "LESSON",
    };

    const listener = vi.fn();
    eventBus.on(EVENTS.PROPOSAL_CREATED, listener);

    broadcastProposalCreated(mockProposal);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(mockProposal);
  });

  it("should broadcast proposal:updated event with correct payload", () => {
    const listener = vi.fn();
    eventBus.on(EVENTS.PROPOSAL_UPDATED, listener);

    broadcastProposalUpdated("approve", "prop-123");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      action: "approve",
      id: "prop-123",
    });
  });
});
