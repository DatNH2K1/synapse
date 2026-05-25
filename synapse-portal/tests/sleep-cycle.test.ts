import { describe, it, expect, vi, beforeEach } from "vitest";
import { sleepCycleService } from "@/lib/services/sleep-cycle-service";
import { prisma } from "@/lib/db";
import { vectorService } from "@/lib/services/vector-service";
import { aiService } from "@/lib/services/ai-service";
import { queueService } from "@/lib/services/queue-service";

// Mock the dependencies
vi.mock("../lib/db", () => {
  return {
    prisma: {
      systemConfig: {
        findUnique: vi.fn(),
        upsert: vi.fn().mockResolvedValue({
          key: "rem_last_run_time",
          value: new Date().toISOString(),
          updatedAt: new Date(),
        }),
      },
      node: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      archive: {
        findMany: vi.fn().mockResolvedValue([]),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(),
      $executeRaw: vi.fn().mockResolvedValue(1),
    },
  };
});

vi.mock("../lib/services/vector-service", () => {
  return {
    vectorService: {
      findSimilarToNode: vi.fn(),
    },
  };
});

vi.mock("../lib/services/ai-service", () => {
  return {
    aiService: {
      synthesizeKnowledge: vi.fn(),
    },
  };
});

vi.mock("../lib/services/queue-service", () => {
  return {
    queueService: {
      enqueueEmbeddingTask: vi.fn().mockResolvedValue({}),
    },
  };
});

describe("REM Sleep Cycle Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC1: Should skip execution if rem_mode_enabled is disabled", async () => {
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null);

    const result = await sleepCycleService.run();

    expect(result.processedCount).toBe(0);
    expect(result.logs[1]).toContain("REM Sleep Mode is disabled");
  });

  it("TC2: Should complete without processing if there are no pending nodes", async () => {
    vi.mocked(prisma.systemConfig.findUnique).mockImplementation(((
      args: unknown,
    ) => {
      const uArgs = args as { where: { key: string } };
      if (uArgs.where.key === "rem_mode_enabled") {
        return Promise.resolve({
          key: "rem_mode_enabled",
          value: "true",
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }) as unknown as typeof prisma.systemConfig.findUnique);
    vi.mocked(prisma.node.findMany).mockResolvedValue([]);

    const result = await sleepCycleService.run();

    expect(result.processedCount).toBe(0);
    expect(result.logs[2]).toContain("No pending nodes found in The Gate");
  });

  it("TC3: Should auto-approve a unique proposal (similarity < threshold)", async () => {
    vi.mocked(prisma.systemConfig.findUnique).mockImplementation(((
      args: unknown,
    ) => {
      const uArgs = args as { where: { key: string } };
      if (uArgs.where.key === "rem_mode_enabled") {
        return Promise.resolve({
          key: "rem_mode_enabled",
          value: "true",
          updatedAt: new Date(),
        });
      }
      if (uArgs.where.key === "rem_similarity_threshold") {
        return Promise.resolve({
          key: "rem_similarity_threshold",
          value: "0.85",
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }) as unknown as typeof prisma.systemConfig.findUnique);

    const mockPendingNode = {
      id: "pending-uuid-1",
      type: "CONTEXT",
      label: "Completely New Idea",
      content_hash: null,
      success_count: 0,
      last_verified: new Date(),
      properties: JSON.stringify({ content: "Unique content details" }),
      status: "PENDING",
      embeddingModel: null,
      tags: [],
    };

    vi.mocked(prisma.node.findMany).mockResolvedValue([
      mockPendingNode,
    ] as unknown as Awaited<ReturnType<typeof prisma.node.findMany>>);
    vi.mocked(vectorService.findSimilarToNode).mockResolvedValue([]); // No similar nodes
    vi.mocked(prisma.node.update).mockResolvedValue({
      ...mockPendingNode,
      status: "BETA",
    } as unknown as Awaited<ReturnType<typeof prisma.node.update>>);

    const result = await sleepCycleService.run();

    expect(result.processedCount).toBe(1);
    expect(result.autoApprovedCount).toBe(1);
    expect(result.autoMergedCount).toBe(0);
    expect(prisma.node.update).toHaveBeenCalledWith({
      where: { id: "pending-uuid-1" },
      data: {
        status: "BETA",
        last_verified: expect.any(Date),
        properties: expect.any(String),
      },
    });
    expect(queueService.enqueueEmbeddingTask).toHaveBeenCalledWith(
      "pending-uuid-1",
      "Completely New Idea",
    );
  });

  it("TC4: Should auto-consolidate (merge) when similarity >= threshold", async () => {
    vi.mocked(prisma.systemConfig.findUnique).mockImplementation(((
      args: unknown,
    ) => {
      const uArgs = args as { where: { key: string } };
      if (uArgs.where.key === "rem_mode_enabled") {
        return Promise.resolve({
          key: "rem_mode_enabled",
          value: "true",
          updatedAt: new Date(),
        });
      }
      if (uArgs.where.key === "rem_similarity_threshold") {
        return Promise.resolve({
          key: "rem_similarity_threshold",
          value: "0.85",
          updatedAt: new Date(),
        });
      }
      if (uArgs.where.key === "rem_confidence_threshold") {
        return Promise.resolve({
          key: "rem_confidence_threshold",
          value: "0.90",
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }) as unknown as typeof prisma.systemConfig.findUnique);

    vi.mocked(prisma.node.findUnique).mockImplementation(((args: unknown) => {
      const uArgs = args as { where: { id: string } };
      if (uArgs.where.id === "active-uuid-1") {
        return Promise.resolve({
          id: "active-uuid-1",
          type: "LESSON",
          label: "Existing SQL Query Optimize",
          content_hash: null,
          success_count: 0,
          last_verified: new Date(),
          properties: JSON.stringify({ content: "Indexing speedups" }),
          status: "APPROVED",
          embeddingModel: null,
          tags: [],
        });
      }
      return Promise.resolve(null);
    }) as unknown as typeof prisma.node.findUnique);

    const mockPendingNode = {
      id: "pending-uuid-2",
      type: "LESSON",
      label: "Optimize DB Queries",
      content_hash: null,
      success_count: 0,
      last_verified: new Date(),
      properties: JSON.stringify({ content: "SQL indexing speedup" }),
      status: "PENDING",
      embeddingModel: null,
      tags: [],
    };

    vi.mocked(prisma.node.findMany).mockResolvedValue([
      mockPendingNode,
    ] as unknown as Awaited<ReturnType<typeof prisma.node.findMany>>);

    // Return high similarity match (0.92 >= 0.85)
    vi.mocked(vectorService.findSimilarToNode).mockResolvedValue([
      {
        id: "active-uuid-1",
        label: "Existing SQL Query Optimize",
        score: 0.92,
      },
    ]);

    vi.mocked(aiService.synthesizeKnowledge).mockResolvedValue({
      label: "Synthesized DB Query Indexing",
      content: "Consolidated index details",
      reason: "Identical optimization topics merged.",
    });

    // Mock the transaction helper
    vi.mocked(prisma.$transaction).mockImplementation(((fn: unknown) => {
      const tx = {
        node: {
          create: vi.fn().mockResolvedValue({
            id: "merged-uuid-99",
            label: "Synthesized DB Query Indexing",
          }),
          update: vi.fn(),
          updateMany: vi.fn(),
        },
        archive: {
          create: vi.fn(),
        },
        $executeRaw: vi.fn(),
      };
      return (fn as (tx: unknown) => unknown)(tx);
    }) as unknown as typeof prisma.$transaction);

    const result = await sleepCycleService.run();

    expect(result.processedCount).toBe(1);
    expect(result.autoApprovedCount).toBe(0);
    expect(result.autoMergedCount).toBe(1);
    expect(aiService.synthesizeKnowledge).toHaveBeenCalled();
    expect(queueService.enqueueEmbeddingTask).toHaveBeenCalledWith(
      "merged-uuid-99",
      "Synthesized DB Query Indexing",
    );
  });

  it("TC5: Should skip execution if REM sleep cycle is already running (concurrency lock)", async () => {
    vi.mocked(prisma.systemConfig.findUnique).mockImplementation(((
      args: unknown,
    ) => {
      const uArgs = args as { where: { key: string } };
      if (uArgs.where.key === "rem_running") {
        return Promise.resolve({
          key: "rem_running",
          value: "true",
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }) as unknown as typeof prisma.systemConfig.findUnique);

    const result = await sleepCycleService.run();

    expect(result.processedCount).toBe(0);
    expect(result.logs[1]).toContain(
      "REM Sleep Cycle is already running. Skipping execution.",
    );
  });
});
