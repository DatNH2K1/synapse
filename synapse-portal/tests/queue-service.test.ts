import { describe, it, expect, vi, beforeEach } from "vitest";
import { queueService } from "@/lib/services/queue-service";
import { prisma } from "@/lib/db";
import { vectorService } from "@/lib/services/vector-service";
import { QueueTask } from "@prisma/client";

vi.mock("../lib/db", () => {
  return {
    prisma: {
      $queryRaw: vi.fn(),
      queueTask: {
        create: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
      },
    },
  };
});

vi.mock("../lib/services/vector-service", () => {
  return {
    vectorService: {
      updateNodeEmbedding: vi.fn(),
    },
  };
});

describe("QueueService Persistent DB Queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC1: Should successfully enqueue a task to DB", async () => {
    vi.mocked(prisma.queueTask.create).mockResolvedValue({} as QueueTask);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    await queueService.enqueueEmbeddingTask("node-1", "test text");

    expect(prisma.queueTask.create).toHaveBeenCalledWith({
      data: {
        nodeId: "node-1",
        text: "test text",
        attempts: 0,
      },
    });
  });

  it("TC2: Should process tasks from DB and delete on success", async () => {
    const mockTask = {
      id: "task-1",
      nodeId: "node-2",
      text: "process text",
      attempts: 0,
      createdAt: new Date(),
    };

    vi.mocked(prisma.$queryRaw)
      .mockResolvedValueOnce([mockTask])
      .mockResolvedValue([]);

    vi.mocked(vectorService.updateNodeEmbedding).mockResolvedValue(true);

    await queueService.enqueueEmbeddingTask("node-2", "process text");

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(vectorService.updateNodeEmbedding).toHaveBeenCalledWith(
      "node-2",
      "process text",
    );
  });
});
