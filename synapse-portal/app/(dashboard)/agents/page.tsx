import fs from "fs";
import path from "path";
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
  identity?: string;
  communicationStyle?: string;
  principles?: string;
  module?: string;
  path?: string;
  complianceChecklist?: string[];
  capabilitiesList?: { code: string; description: string; skill: string }[];
  principlesList?: string[];
  protocols?: {
    contextLoad?: string;
    gatekeeper?: string;
  };
}

interface Skill {
  canonicalId: string;
  name: string;
  description: string;
  module: string;
  path: string;
}

function parseSkillMd(skillPath: string) {
  try {
    const possiblePaths = [
      path.join(process.cwd(), "..", ".agent", skillPath),
      path.join(process.cwd(), ".agent", skillPath),
      path.join("/app/data", ".agent", skillPath),
    ];

    let filePath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        filePath = p;
        break;
      }
    }

    if (!filePath) return null;

    const content = fs.readFileSync(filePath, "utf-8");
    const complianceChecklist: string[] = [];
    const capabilitiesList: { code: string; description: string; skill: string }[] = [];
    const principlesList: string[] = [];
    let contextLoad = "";
    let gatekeeper = "";

    const lines = content.split("\n");
    let currentSection = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("# ")) {
        currentSection = line.replace("# ", "").trim().toUpperCase();
        continue;
      } else if (line.startsWith("## ")) {
        currentSection = line.replace("## ", "").trim().toUpperCase();
        continue;
      }

      // 1. Compliance Checklist
      if (currentSection.includes("COMPLIANCE CHECKLIST")) {
        if (line.startsWith("- [ ]") || line.startsWith("- [x]")) {
          const item = line.replace(/^-\s*\[[ x]\]\s*/i, "").trim().replace(/\*\*/g, "");
          complianceChecklist.push(item);
        }
      }

      // 2. Principles
      if (currentSection.includes("PRINCIPLES")) {
        if (line.startsWith("- ")) {
          principlesList.push(line.replace(/^-\s*/, "").trim());
        }
      }

      // 3. Capabilities Table
      if (currentSection.includes("CAPABILITIES")) {
        if (line.startsWith("|")) {
          if (line.includes("---")) continue;
          const parts = line.split("|").map((p) => p.trim()).filter((p) => p !== "");
          if (parts.length >= 3) {
            const code = parts[0];
            if (code.toLowerCase() === "code") continue;
            capabilitiesList.push({
              code,
              description: parts[1],
              skill: parts[2],
            });
          }
        }
      }

      // 4. Context Load
      if (currentSection.includes("CONTEXT LOAD")) {
        if (!line.startsWith("##") && !line.startsWith("#")) {
          contextLoad += line + "\n";
        }
      }

      // 5. Gatekeeper
      if (currentSection.includes("GATEKEEPER")) {
        if (!line.startsWith("##") && !line.startsWith("#")) {
          gatekeeper += line + "\n";
        }
      }
    }

    return {
      complianceChecklist,
      capabilitiesList,
      principlesList: principlesList.map((p) => p.trim()).filter((p) => p !== ""),
      protocols: {
        contextLoad: contextLoad.trim(),
        gatekeeper: gatekeeper.trim(),
      },
    };
  } catch (e) {
    console.error("Error parsing SKILL.md", e);
    return null;
  }
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
          const agentObj: Agent = {
            name: cleanParts[0],
            displayName: cleanParts[1],
            title: cleanParts[2],
            icon: cleanParts[3],
            capabilities: cleanParts[4],
            role: cleanParts[5],
            identity: cleanParts[6] || "",
            communicationStyle: cleanParts[7] || "",
            principles: cleanParts[8] || "",
            module: cleanParts[9] || "",
            path: cleanParts[10] || "",
          };

          if (agentObj.path) {
            const parsed = parseSkillMd(agentObj.path);
            if (parsed) {
              agentObj.complianceChecklist = parsed.complianceChecklist;
              agentObj.capabilitiesList = parsed.capabilitiesList;
              if (parsed.principlesList && parsed.principlesList.length > 0) {
                agentObj.principlesList = parsed.principlesList;
              }
              agentObj.protocols = parsed.protocols;
            }
          }

          return agentObj;
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
