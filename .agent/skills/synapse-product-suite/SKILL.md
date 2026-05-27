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

## 🚦 INTELLIGENCE DISPATCHER & SUB-SKILL REGISTRY

When executing any phase, you MUST refer to the registry table below and **only load/query the sub-skills whose Activation Criteria match the current task context** (Lazy/Conditional Loading pattern) to prevent token waste and context bloat. Do NOT load sub-skills whose activation criteria are not met.

| Sub-Skill | Portable Path | Primary Role | Activation Criteria |
| :--- | :--- | :--- | :--- |
| **PRD Creation** | [`./references/create-prd/SKILL.md`](./references/create-prd/SKILL.md) | Standardized PRD formatting and writing | Triggered when defining a new product or feature |
| **PRD Validation** | [`./references/validate-prd/SKILL.md`](./references/validate-prd/SKILL.md) | Enforces compliance, completeness, readability | Enforced automatically whenever a PRD is created/modified |
| **Edit PRD** | [`./references/edit-prd/SKILL.md`](./references/edit-prd/SKILL.md) | Guides editing and refinement of existing PRDs | Triggered when modifying or updating a PRD |
| **PRFAQ** | [`./references/prfaq/SKILL.md`](./references/prfaq/SKILL.md) | Working Backwards product design method | Triggered during early concept validation and ideation |
| **Product Brief** | [`./references/product-brief/SKILL.md`](./references/product-brief/SKILL.md) | Core product high-level definition | Triggered before writing a full PRD |
| **Brainstorming** | [`./references/brainstorming/SKILL.md`](./references/brainstorming/SKILL.md) | Creative feature discovery and ideation | Triggered during feature brainstorming |
| **Distillator** | [`./references/distillator/SKILL.md`](./references/distillator/SKILL.md) | Requirements distillation and simplification | Triggered to shrink long specification documents |
| **Shard Doc** | [`./references/shard-doc/SKILL.md`](./references/shard-doc/SKILL.md) | Breaking complex specs into isolated chunks | Triggered when document size exceeds context safety |
| **Epics & Stories** | [`./references/epics-and-stories/SKILL.md`](./references/epics-and-stories/SKILL.md) | Breaking requirements into tasks, Gherkin syntax | Triggered during task decomposition |
| **Create Story** | [`./references/create-story/SKILL.md`](./references/create-story/SKILL.md) | Writing structured, implementable user stories | Triggered when writing dev stories |
| **Sprint Planning** | [`./references/sprint-planning/SKILL.md`](./references/sprint-planning/SKILL.md) | Setup sprint roadmap and task list | Triggered when starting a new sprint |
| **Sprint Status** | [`./references/sprint-status/SKILL.md`](./references/sprint-status/SKILL.md) | Tracks progress and identifies blockers | Triggered during daily reviews and updates |
| **Readiness Check** | [`./references/readiness-check/SKILL.md`](./references/readiness-check/SKILL.md) | Verifies codebase, dependencies, and risk status | Enforced before sprint planning or task execution |
| **Retrospective** | [`./references/retrospective/SKILL.md`](./references/retrospective/SKILL.md) | Post-sprint review and portal memory updates | Triggered when wrapping up sprints or tasks |

---

## 🛠️ ACTIVE INTEGRATION WORKFLOWS

### 1. Vision & Definition (Event-Driven Triggers)
- When writing a PRD (using `create-prd`), you **MUST** immediately run it through the validation checklist in `validate-prd` to ensure it is structurally sound, clear, and ready for development.

### 2. Decomposition & Execution
- During decomposition, verify that every Epic and User Story has direct traceability back to the parent PRD requirements. Use `epics-and-stories` formatting guidelines.
- Before committing to a Sprint, perform a checklist pass against `readiness-check` to surface environment blockages and third-party dependencies early.

---

## 🔒 AUTOMATED QUALITY CHECKPOINTS

Before concluding product work:
- [ ] **Requirements Compliance**: Verify the PRD has passed the `validate-prd` compliance gate.
- [ ] **Value Traceability**: Ensure each created task has a linked requirement ID mapping back to the PRD.
- [ ] **Retro Completion**: If closing a sprint or epic, trigger a project retrospective (`retrospective`) to capture lessons in the knowledge portal.

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
"Let's refine the vision", "Create a PRD for X", "Plan the next sprint", or "Check our current status". The Master Suite will coordinate the expert layers, enforce the validation checkpoints, and ensure value traceability.