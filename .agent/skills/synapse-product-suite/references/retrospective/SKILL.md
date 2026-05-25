---
name: synapse-product-suite
description: 'Post-epic review to extract lessons and assess success. Use when the user says "run a retrospective" or "lets retro the epic [epic]"'
  - synapse-memory Knowledge Portal
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Retrospective Agent

Follow the instructions in ./workflow.md.

## AI Lessons Learned (Mandatory)

> **Before performing any retrospective, you MUST:**
> 1. Execute JIT Grounding using the `synapse-memory` skill (Global Hub) — always.
> 2. Read `memory/context/lessons-context.csv` to resolve current project and technologies.
> 3. Load `lessons_file` entries from CSV where `scope in (technology, project)` and `status=exists`.

---

## Lessons Learned Discovery & Storage

> **CRITICAL: The retrospective MUST result in updated AI memory.**
>
> For each lesson identified in Step 3:
> 1. Determine scope (global / technology / project).
> 2. Classify as `Mistake to AVOID` or `Optimized Technique`.
> 3. Write to the appropriate lessons file via `synapse-core-system`.
>
> This ensures lessons are persisted in the AI memory system and will be automatically applied in all future sessions.

Confirm to the user:
- Path to retrospective report
- List of lesson entries written to memory (with target files)