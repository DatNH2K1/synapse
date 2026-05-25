---
name: synapse-product-suite
description: 'Master Product Suite: An end-to-end management layer covering Ideation, PRD Definition, Work Decomposition (Epics/Stories), and Sprint Execution.'
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Master Product Suite

This skill is the central nervous system for product management in Synapse. It intelligently orchestrates the entire product lifecycle from initial vision to sprint tracking.

## 🚦 INTELLIGENCE DISPATCHER

The system uses `scripts/dispatcher.py` to automatically detect the current maturity stage of your request:

- **STAGE 1: IDEATION** (Vision, PRFAQ, Brief)
    - Detects: "idea", "vision", "brief", "FAQ", "what if".
- **STAGE 2: DEFINITION** (PRD, Requirements, Distillation)
    - Detects: "PRD", "requirements", "spec", "document", "distill".
- **STAGE 3: DECOMPOSITION** (Epics, Stories, Breaking down)
    - Detects: "epics", "stories", "breakdown", "task list".
- **STAGE 4: EXECUTION** (Sprint, Status, Readiness, Retro)
    - Detects: "sprint", "status", "readiness", "retro", "planning".

---

## 🛠️ CORE WORKFLOWS

### 1. Vision to PRD
Transition from high-level PRFAQ and Product Briefs into structured PRDs using automated validation to ensure implementation readiness.

### 2. PRD to Execution
Breaking down technical requirements into actionable Epics and User Stories, then mapping them into a Sprint Plan.

### 3. Health & Readiness
Continuous monitoring of implementation readiness and sprint status to surface risks early.

---

## 📂 FULL REFERENCES (Portable Relative Paths)

The Master Suite maintains the full integrity of all specialized PM methodologies:

### Stage 1: Ideation
- [PRFAQ (Working Backwards)](./references/prfaq/SKILL.md)
- [Product Brief](./references/product-brief/SKILL.md)
- [Brainstorming](./references/brainstorming/SKILL.md)

### Stage 2: Definition
- [PRD Creation](./references/create-prd/SKILL.md)
- [PRD Validation](./references/validate-prd/SKILL.md)
- [Content Distillation](./references/distillator/SKILL.md)

### Stage 3: Decomposition
- [Epics & Stories Breakdown](./references/epics-and-stories/SKILL.md)
- [User Story Creation](./references/create-story/SKILL.md)
- [Document Sharding](./references/shard-doc/SKILL.md)

### Stage 4: Execution
- [Sprint Planning](./references/sprint-planning/SKILL.md)
- [Sprint Status & Risks](./references/sprint-status/SKILL.md)
- [Implementation Readiness](./references/readiness-check/SKILL.md)
- [Project Retrospective](./references/retrospective/SKILL.md)

## USAGE
"Let's refine the vision", "Create a PRD for X", "Plan the next sprint", or "Check our current status". The Master Suite will dispatch the correct layer.