---
name: synapse-core-system
description: 'Master Core System: The central management layer for Synapse operations, covering Project Admin, Context Optimization, and Agent Orchestration.'
metadata:
  author: synapse
  version: "1.1.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Master Core System

This is the operational core of Synapse. It manages the underlying infrastructure, project metadata, and communication protocols between specialized agents.

## 🚦 INTELLIGENCE DISPATCHER & SUB-SKILL REGISTRY

When executing any layer, you MUST refer to the registry table below and **only load/query the sub-skills whose Activation Criteria match the current task context** (Lazy/Conditional Loading pattern) to prevent token waste and context bloat. Do NOT load sub-skills whose activation criteria are not met.

| Sub-Skill | Portable Path | Primary Role | Activation Criteria |
| :--- | :--- | :--- | :--- |
| **Context Engineering** | [`./references/context-engineering/SKILL.md`](./references/context-engineering/SKILL.md) | Manages token usage and filters context | Triggered on token optimization, long transcripts, or party-mode setup AND CONTEXT7_API_KEY environment variable is configured |
| **Skill Indexer** | [`./references/skill-indexer/SKILL.md`](./references/skill-indexer/SKILL.md) | Registers projects and scans/indexes skills | Triggered during configuration or project registration |
| **Orchestration Protocol** | [`./references/orchestration/SKILL.md`](./references/orchestration/SKILL.md) | Orchestrates multi-agent roundtables and events | Triggered for agent routing, party-mode, or roundtables |
| **Help Center** | [`./references/help/SKILL.md`](./references/help/SKILL.md) | Help documentation and workspace setup guidelines | Triggered when user asks "how-to" questions or config help |

---

## 🛠️ ACTIVE INTEGRATION WORKFLOWS

### 1. Context & Performance Management
- When preparing high-volume agent roundtables or loading complex files, you **MUST** run the summarization and optimization workflows in `context-engineering` to keep the active token budget within safe operational limits.

### 2. Multi-agent Orchestration
- During multi-agent setups, enforce routing conventions and agent lifecycle management protocols as defined in `orchestration`.

---

## 🔒 AUTOMATED QUALITY CHECKPOINTS

Before concluding system admin tasks:
- [ ] **Context Budget Pass**: Verify that the remaining token budget is optimized using `context-engineering` tools.
- [ ] **Index Freshness**: Verify that all newly created project files or custom subagents are indexed using `skill-indexer`.
- [ ] **Protocol Compliance**: Ensure all spawned subagents adhere to the orchestration protocols.

---

## 📂 FULL REFERENCES (Portable Relative Paths)

### Administration
- [Skill Indexer](./references/skill-indexer/SKILL.md)
- [Synapse Help Center](./references/help/SKILL.md)

### System Engine
- [Context Engineering](./references/context-engineering/SKILL.md)
- [Orchestration Protocol](./references/orchestration/SKILL.md)

## USAGE
"Register a new project", "Check my current context usage", or "How do I use Synapse?". The Master Suite will coordinate the expert layers and enforce the system checkpoints.