/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getEdges } from "@/app/api/edges/route";
import { GET as getNodes } from "@/app/api/nodes/route";
import { GET as getStats } from "@/app/api/stats/route";
import { POST as postEfficacy } from "@/app/api/nodes/efficacy/route";
import { POST as postSleepCycle } from "@/app/api/gate/sleep-cycle/route";
import { POST as postVisualConfig } from "@/app/api/visual-config/route";
import { POST as postPropose } from "@/app/api/propose/route";
import { POST as postGate } from "@/app/api/gate/route";
import { POST as postMerge } from "@/app/api/gate/merge/route";
import { POST as postSynthesize } from "@/app/api/gate/synthesize/route";
import {
  GET as getSystemConfig,
  POST as postSystemConfig,
} from "@/app/api/system-config/route";
import { GET as getUpdates } from "@/app/api/updates/route";

import { knowledgeService } from "@/lib/services/knowledge-service";
import { sleepCycleService } from "@/lib/services/sleep-cycle-service";
import { aiService } from "@/lib/services/ai-service";
import { prisma } from "@/lib/db";
import { eventBus, EVENTS } from "@/lib/services/event-service";

vi.mock("@/lib/services/knowledge-service", () => ({
  knowledgeService: {
    getEdges: vi.fn(),
    getNodesWithColor: vi.fn(),
    getStats: vi.fn(),
    incrementSuccessCount: vi.fn(),
    proposeKnowledge: vi.fn(),
    rejectPendingUpdate: vi.fn(),
    approvePendingUpdate: vi.fn(),
    undoAction: vi.fn(),
    wakeUpNode: vi.fn(),
    mergeNodes: vi.fn(),
    getPendingUpdates: vi.fn(),
  },
}));

vi.mock("@/lib/services/sleep-cycle-service", () => ({
  sleepCycleService: {
    run: vi.fn(),
  },
}));

vi.mock("@/lib/services/ai-service", () => ({
  aiService: {
    synthesizeKnowledge: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    tag: {
      update: vi.fn(),
    },
    node: {
      findMany: vi.fn(),
    },
    systemConfig: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("API Routes Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventBus.removeAllListeners();
  });

  describe("GET /api/edges", () => {
    it("should return edges list on success", async () => {
      const mockEdges = [{ id: "edge-1", source: "A", target: "B" }];
      vi.mocked(knowledgeService.getEdges).mockResolvedValue(mockEdges as any);

      const response = await getEdges();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockEdges);
    });

    it("should return 500 status on service failure", async () => {
      vi.mocked(knowledgeService.getEdges).mockRejectedValue(
        new Error("Database failure"),
      );

      const response = await getEdges();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: "Failed to fetch edges" });
    });
  });

  describe("GET /api/nodes", () => {
    it("should return nodes list on success", async () => {
      const mockNodes = [{ id: "node-1", label: "Node 1" }];
      vi.mocked(knowledgeService.getNodesWithColor).mockResolvedValue(
        mockNodes as any,
      );

      const response = await getNodes();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockNodes);
    });

    it("should return 500 status on service failure", async () => {
      vi.mocked(knowledgeService.getNodesWithColor).mockRejectedValue(
        new Error("Database failure"),
      );

      const response = await getNodes();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: "Failed to fetch nodes" });
    });
  });

  describe("GET /api/stats", () => {
    it("should return stats on success", async () => {
      const mockStats = { totalNodes: 10, totalEdges: 5 };
      vi.mocked(knowledgeService.getStats).mockResolvedValue(mockStats as any);

      const response = await getStats();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockStats);
    });

    it("should return 500 status on service failure", async () => {
      vi.mocked(knowledgeService.getStats).mockRejectedValue(
        new Error("Stats error"),
      );

      const response = await getStats();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: "Failed to fetch stats" });
    });
  });

  describe("POST /api/nodes/efficacy", () => {
    it("should return 400 if nodeId is missing in request", async () => {
      const req = new Request("http://localhost/api/nodes/efficacy", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await postEfficacy(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ success: false, message: "Node ID is required" });
    });

    it("should return updated successCount on success", async () => {
      const req = new Request("http://localhost/api/nodes/efficacy", {
        method: "POST",
        body: JSON.stringify({ nodeId: "node-123" }),
      });

      vi.mocked(knowledgeService.incrementSuccessCount).mockResolvedValue({
        id: "node-123",
        success_count: 3,
      } as any);

      const response = await postEfficacy(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.nodeId).toBe("node-123");
      expect(data.successCount).toBe(3);
    });

    it("should return 500 on database error", async () => {
      const req = new Request("http://localhost/api/nodes/efficacy", {
        method: "POST",
        body: JSON.stringify({ nodeId: "node-123" }),
      });

      vi.mocked(knowledgeService.incrementSuccessCount).mockRejectedValue(
        new Error("DB Error"),
      );

      const response = await postEfficacy(req);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("DB Error");
    });
  });

  describe("POST /api/gate/sleep-cycle", () => {
    it("should trigger sleep cycle service successfully", async () => {
      const mockSummary = { forgotten: 2, kept: 8 };
      vi.mocked(sleepCycleService.run).mockResolvedValue(mockSummary as any);

      const response = await postSleepCycle();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.summary).toEqual(mockSummary);
    });

    it("should return 500 if sleep cycle service fails", async () => {
      vi.mocked(sleepCycleService.run).mockRejectedValue(
        new Error("Sleep cycle crashed"),
      );

      const response = await postSleepCycle();
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Sleep cycle crashed");
    });
  });

  describe("POST /api/visual-config", () => {
    it("should update tag color successfully", async () => {
      const req = new Request("http://localhost/api/visual-config", {
        method: "POST",
        body: JSON.stringify({ id: "tag-1", color: "#ff0000" }),
      });

      vi.mocked(prisma.tag.update).mockResolvedValue({} as any);

      const response = await postVisualConfig(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        data: { color: "#ff0000" },
      });
    });

    it("should return 500 if prisma update fails", async () => {
      const req = new Request("http://localhost/api/visual-config", {
        method: "POST",
        body: JSON.stringify({ id: "tag-1", color: "#ff0000" }),
      });

      vi.mocked(prisma.tag.update).mockRejectedValue(new Error("Prisma error"));

      const response = await postVisualConfig(req);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe("Server Error");
    });
  });

  describe("POST /api/propose", () => {
    it("should return 400 if required fields are missing", async () => {
      const req = new Request("http://localhost/api/propose", {
        method: "POST",
        body: JSON.stringify({ label: "Missing fields" }),
      });

      const response = await postPropose(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("should return proposed knowledge result on success", async () => {
      const req = new Request("http://localhost/api/propose", {
        method: "POST",
        body: JSON.stringify({
          label: "Test",
          content: "Body",
          type: "LESSON",
        }),
      });

      const mockResult = { success: true, id: "prop-id" };
      vi.mocked(knowledgeService.proposeKnowledge).mockResolvedValue(
        mockResult,
      );

      const response = await postPropose(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockResult);
    });

    it("should return 500 if error is thrown", async () => {
      const req = new Request("http://localhost/api/propose", {
        method: "POST",
        body: JSON.stringify({
          label: "Test",
          content: "Body",
          type: "LESSON",
        }),
      });

      vi.mocked(knowledgeService.proposeKnowledge).mockRejectedValue(
        new Error("Propose error"),
      );

      const response = await postPropose(req);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Propose error");
    });
  });

  describe("POST /api/gate", () => {
    it("should return 400 if id is not a string", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: 123, action: "REJECT" }),
      });

      const response = await postGate(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("Invalid ID format");
    });

    it("should handle REJECT action", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "REJECT" }),
      });

      const response = await postGate(req);
      expect(response.status).toBe(200);
      expect(knowledgeService.rejectPendingUpdate).toHaveBeenCalledWith(
        "node-id",
      );
    });

    it("should handle APPROVE action", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "APPROVE" }),
      });

      const response = await postGate(req);
      expect(response.status).toBe(200);
      expect(knowledgeService.approvePendingUpdate).toHaveBeenCalledWith(
        "node-id",
      );
    });

    it("should handle UNDO action successfully", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "UNDO", type: "LESSON" }),
      });

      vi.mocked(knowledgeService.undoAction).mockResolvedValue({
        success: true,
      });

      const response = await postGate(req);
      expect(response.status).toBe(200);
      expect(knowledgeService.undoAction).toHaveBeenCalledWith(
        "node-id",
        "LESSON",
      );
    });

    it("should return 400 if UNDO action fails", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "UNDO", type: "LESSON" }),
      });

      vi.mocked(knowledgeService.undoAction).mockResolvedValue({
        success: false,
        message: "Undo failed",
      });

      const response = await postGate(req);
      expect(response.status).toBe(400);
    });

    it("should handle WAKEUP action", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "WAKEUP" }),
      });

      const response = await postGate(req);
      expect(response.status).toBe(200);
      expect(knowledgeService.wakeUpNode).toHaveBeenCalledWith("node-id");
    });

    it("should return 400 for unknown action", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "INVALID" }),
      });

      const response = await postGate(req);
      expect(response.status).toBe(400);
    });

    it("should return 500 on server error", async () => {
      const req = new Request("http://localhost/api/gate", {
        method: "POST",
        body: JSON.stringify({ id: "node-id", action: "APPROVE" }),
      });

      vi.mocked(knowledgeService.approvePendingUpdate).mockRejectedValue(
        new Error("Database crash"),
      );

      const response = await postGate(req);
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/gate/merge", () => {
    it("should return 400 if action is not MERGE", async () => {
      const req = new Request("http://localhost/api/gate/merge", {
        method: "POST",
        body: JSON.stringify({ action: "APPROVE" }),
      });

      const response = await postMerge(req);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it("should merge nodes successfully", async () => {
      const req = new Request("http://localhost/api/gate/merge", {
        method: "POST",
        body: JSON.stringify({
          action: "MERGE",
          sourceNodeIds: ["node-1", "node-2"],
          newLabel: "Merged Node",
          newType: "LESSON",
          newContent: "Merged Body",
        }),
      });

      vi.mocked(knowledgeService.mergeNodes).mockResolvedValue({
        id: "merged-id",
      } as any);

      const response = await postMerge(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.newNodeId).toBe("merged-id");
    });

    it("should return 500 if merge service fails", async () => {
      const req = new Request("http://localhost/api/gate/merge", {
        method: "POST",
        body: JSON.stringify({ action: "MERGE" }),
      });

      vi.mocked(knowledgeService.mergeNodes).mockRejectedValue(
        new Error("Merge error"),
      );

      const response = await postMerge(req);
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/gate/synthesize", () => {
    it("should return 400 if less than two node IDs are provided", async () => {
      const req = new Request("http://localhost/api/gate/synthesize", {
        method: "POST",
        body: JSON.stringify({ nodeIds: ["node-1"] }),
      });

      const response = await postSynthesize(req);
      expect(response.status).toBe(400);
    });

    it("should return 404 if some nodes are not found", async () => {
      const req = new Request("http://localhost/api/gate/synthesize", {
        method: "POST",
        body: JSON.stringify({ nodeIds: ["node-1", "node-2"] }),
      });

      vi.mocked(prisma.node.findMany).mockResolvedValue([
        { id: "node-1" },
      ] as any);

      const response = await postSynthesize(req);
      expect(response.status).toBe(404);
    });

    it("should synthesize nodes successfully", async () => {
      const req = new Request("http://localhost/api/gate/synthesize", {
        method: "POST",
        body: JSON.stringify({ nodeIds: ["node-1", "node-2"] }),
      });

      vi.mocked(prisma.node.findMany).mockResolvedValue([
        {
          id: "node-1",
          label: "Node 1",
          properties: JSON.stringify({ content: "C1" }),
        },
        {
          id: "node-2",
          label: "Node 2",
          properties: JSON.stringify({ content: "C2" }),
        },
      ] as any);

      const mockSynthesisResult = {
        label: "Synthesized",
        content: "Resulting content",
        reason: "Good reason",
      };
      vi.mocked(aiService.synthesizeKnowledge).mockResolvedValue(
        mockSynthesisResult,
      );

      const response = await postSynthesize(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.label).toBe("Synthesized");
    });

    it("should return 500 if synthesis service fails", async () => {
      const req = new Request("http://localhost/api/gate/synthesize", {
        method: "POST",
        body: JSON.stringify({ nodeIds: ["node-1", "node-2"] }),
      });

      vi.mocked(prisma.node.findMany).mockRejectedValue(
        new Error("Prisma error"),
      );

      const response = await postSynthesize(req);
      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/system-config", () => {
    it("should return transformed configs on success", async () => {
      vi.mocked(prisma.systemConfig.findMany).mockResolvedValue([
        { key: "rem_mode_enabled", value: "true" },
        { key: "rem_similarity_threshold", value: "0.85" },
      ] as any);

      const response = await getSystemConfig();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.config).toEqual({
        rem_mode_enabled: "true",
        rem_similarity_threshold: "0.85",
      });
    });

    it("should return 500 if database query fails", async () => {
      vi.mocked(prisma.systemConfig.findMany).mockRejectedValue(
        new Error("Database offline"),
      );

      const response = await getSystemConfig();
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/system-config", () => {
    it("should return 400 if key or value is not a string", async () => {
      const req = new Request("http://localhost/api/system-config", {
        method: "POST",
        body: JSON.stringify({ key: 123, value: "true" }),
      });

      const response = await postSystemConfig(req);
      expect(response.status).toBe(400);
    });

    it("should return 400 if boolean key is not true/false", async () => {
      const req = new Request("http://localhost/api/system-config", {
        method: "POST",
        body: JSON.stringify({ key: "rem_mode_enabled", value: "maybe" }),
      });

      const response = await postSystemConfig(req);
      expect(response.status).toBe(400);
    });

    it("should return 400 if threshold key is not a float between 0.0 and 1.0", async () => {
      const req = new Request("http://localhost/api/system-config", {
        method: "POST",
        body: JSON.stringify({ key: "rem_similarity_threshold", value: "1.5" }),
      });

      const response = await postSystemConfig(req);
      expect(response.status).toBe(400);
    });

    it("should upsert config and return 200 on success", async () => {
      const req = new Request("http://localhost/api/system-config", {
        method: "POST",
        body: JSON.stringify({ key: "rem_similarity_threshold", value: "0.8" }),
      });

      vi.mocked(prisma.systemConfig.upsert).mockResolvedValue({} as any);

      const response = await postSystemConfig(req);
      expect(response.status).toBe(200);
      expect(prisma.systemConfig.upsert).toHaveBeenCalledWith({
        where: { key: "rem_similarity_threshold" },
        update: { value: "0.8" },
        create: { key: "rem_similarity_threshold", value: "0.8" },
      });
    });

    it("should return 500 if database upsert fails", async () => {
      const req = new Request("http://localhost/api/system-config", {
        method: "POST",
        body: JSON.stringify({ key: "random_key", value: "val" }),
      });

      vi.mocked(prisma.systemConfig.upsert).mockRejectedValue(
        new Error("Upsert crash"),
      );

      const response = await postSystemConfig(req);
      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/updates (SSE)", () => {
    it("should connect, stream pending count, and handle eventBus events", async () => {
      vi.mocked(knowledgeService.getPendingUpdates).mockResolvedValue([
        { id: "node-1" },
      ] as any);

      const mockReq = {
        signal: {
          addEventListener: vi.fn(),
        },
      } as any;

      const response = await getUpdates(mockReq);
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/event-stream");

      const reader = response.body!.getReader();

      // Read initial connection message
      const chunk1 = await reader.read();
      const text1 = new TextDecoder().decode(chunk1.value);
      expect(text1).toContain('"type":"connected"');

      // Read initial pending updates counts
      const chunk2 = await reader.read();
      const text2 = new TextDecoder().decode(chunk2.value);
      expect(text2).toContain('"type":"init"');
      expect(text2).toContain('"pendingCount":1');

      // Emit a proposal created event on eventBus
      vi.mocked(knowledgeService.getPendingUpdates).mockResolvedValue([
        { id: "node-1" },
        { id: "node-2" },
      ] as any);

      eventBus.emit(EVENTS.PROPOSAL_CREATED, {
        id: "node-2",
        label: "New Proposal",
        type: "LESSON",
      });

      const chunk3 = await reader.read();
      const text3 = new TextDecoder().decode(chunk3.value);
      expect(text3).toContain(EVENTS.PROPOSAL_CREATED);
      expect(text3).toContain('"pendingCount":2');

      // Emit updates event
      eventBus.emit(EVENTS.PROPOSAL_UPDATED, {
        action: "APPROVE",
        id: "node-2",
      });
      const chunk4 = await reader.read();
      const text4 = new TextDecoder().decode(chunk4.value);
      expect(text4).toContain(EVENTS.PROPOSAL_UPDATED);
      expect(text4).toContain('"action":"APPROVE"');

      // Verify abort handler cleans up listeners
      expect(mockReq.signal.addEventListener).toHaveBeenCalledWith(
        "abort",
        expect.any(Function),
      );
      const abortListener = vi.mocked(mockReq.signal.addEventListener).mock
        .calls[0][1] as any;

      const offSpy = vi.spyOn(eventBus, "off");
      abortListener();
      expect(offSpy).toHaveBeenCalled();
    });
  });
});
