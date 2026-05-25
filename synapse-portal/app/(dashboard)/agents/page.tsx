import fs from "fs";
import { AGENT_MANIFEST_PATH, SKILL_MANIFEST_PATH } from "@/lib/db";
import AgentsPageContent from "./page_content";

export const dynamic = "force-dynamic";

interface Agent {
  name: string;
  displayName: string;
  title: string;
  icon: string;
  capabilities: string;
  role: string;
}

interface Skill {
  canonicalId: string;
  name: string;
  description: string;
  module: string;
  path: string;
}

export default function AgentsPage() {
  let agents: Agent[] = [];
  let skills: Skill[] = [];

  // Parse Agents
  try {
    if (fs.existsSync(AGENT_MANIFEST_PATH)) {
      const content = fs.readFileSync(AGENT_MANIFEST_PATH, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      agents = lines
        .slice(1)
        .map((line) => {
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (!parts || parts.length < 6) return null;
          const cleanParts = parts.map((p) => p.trim().replace(/^"|"$/g, ""));
          return {
            name: cleanParts[0],
            displayName: cleanParts[1],
            title: cleanParts[2],
            icon: cleanParts[3],
            capabilities: cleanParts[4],
            role: cleanParts[5],
          };
        })
        .filter((a) => a !== null) as Agent[];
    }
  } catch (e) {
    console.error("Failed to load agents", e);
  }

  // Parse Skills
  try {
    if (fs.existsSync(SKILL_MANIFEST_PATH)) {
      const content = fs.readFileSync(SKILL_MANIFEST_PATH, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim() !== "");
      skills = lines
        .slice(1)
        .map((line) => {
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (!parts || parts.length < 5) return null;
          const cleanParts = parts.map((p) => p.trim().replace(/^"|"$/g, ""));
          return {
            canonicalId: cleanParts[0],
            name: cleanParts[1],
            description: cleanParts[2],
            module: cleanParts[3],
            path: cleanParts[4],
          };
        })
        .filter((s) => s !== null) as Skill[];
    }
  } catch (e) {
    console.error("Failed to load skills", e);
  }

  return (
    <AgentsPageContent
      agents={JSON.parse(JSON.stringify(agents))}
      skills={JSON.parse(JSON.stringify(skills))}
    />
  );
}
