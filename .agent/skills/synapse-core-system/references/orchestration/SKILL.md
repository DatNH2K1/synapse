---
name: synapse-core-system
description: Rules for sub-agent coordination, status reporting, and context isolation.
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Orchestration & Status Protocol

Standardized rules for spawning, managing, and reporting progress for Synapse sub-agents.

## Sub-agent Status Protocol (MANDATORY)

Every sub-agent MUST end its response with a status report to allow the main agent to coordinate effectively.

| Status | Meaning | Action |
|--------|---------|--------|
| **DONE** | Task completed successfully. | Proceed to next step. |
| **DONE_WITH_CONCERNS** | Completed but with potential risks or tech debt. | Review concerns, then proceed. |
| **BLOCKED** | Cannot proceed due to error or external factor. | Resolve blocker before retry. |
| **NEEDS_CONTEXT** | Missing information to complete the task. | Provide info and re-dispatch. |

### Reporting Format
```
**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
**Summary:** [1-2 sentence summary of results]
**Concerns/Blockers:** [Detailed explanation if status is not DONE]
```

## Context Isolation Principle

**Sub-agents receive only the context they need.** Never pass full session history.

1. **Explicit Prompts:** Provide specific task descriptions and file paths.
2. **No Session Bloat:** Summarize relevant previous decisions; don't replay history.
3. **Scope References:** List exactly which files to read or modify.
4. **Project Pathing:** Always include `Work context: [root path]` in sub-agent prompts.

## Delegation Rules

- **Parallelism:** Spawn independent tasks simultaneously (e.g., Frontend + Backend).
- **Sequential Chaining:** Use when a step depends on the output of the previous one (e.g., Plan -> Code -> Test).
- **Escalation:** If a sub-agent fails 3+ times on the same task, escalate to the User.