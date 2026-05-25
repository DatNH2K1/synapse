import { vectorService } from "@/lib/services/vector-service";
import { prisma } from "@/lib/db";

async function main() {
  console.log("🚀 Starting Vector Re-indexing...");

  const nodes = await prisma.node.findMany({
    where: { status: "APPROVED" },
  });

  console.log(`📦 Found ${nodes.length} approved nodes to re-index.`);

  for (const node of nodes) {
    process.stdout.write(`🔄 Re-indexing [${node.id}] ${node.label}... `);
    try {
      await vectorService.updateNodeEmbedding(node.id, node.label);
      console.log("✅ Done");
    } catch (e) {
      console.log("❌ Failed");
      console.error(e);
    }
  }

  console.log("✨ Re-indexing complete!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
