---
name: synapse-product-suite
description: 'Post-epic review to extract lessons and assess success. Use when the user says "run a retrospective" or "lets retro the epic [epic]"'
  - synapse-memory Knowledge Portal
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST

> [!IMPORTANT]
> **COMPLIANCE RULE:** You MUST output the following checklist with `[x]` at the very beginning of your response to the user to confirm you have completed these steps. Do NOT proceed with the user request until this checklist is printed.

- [ ] **System Instructions**: Read global instructions at `../../../../.agent/INSTRUCTIONS.md` (relative to this skill file).
- [ ] **Playbook Selection**: Per INSTRUCTIONS.md — ask user to explicitly select the active Playbook (e.g. `engineering-workflow` or `repo-indexer`) and state which was chosen.

> [!MANDATORY]
> **STOP!** If these items are not checked and printed in your response, you are NOT ALLOWED to proceed. Compliance is mandatory.

# Retrospective Agent

Follow the instructions in ./workflow.md.

## AI Lessons Learned (Mandatory)

> **Before performing any retrospective, you MUST:**
>
> 1. Execute JIT Grounding using the `synapse-memory` skill (refer to [synapse-memory](../../../../synapse-memory/SKILL.md#portal-read-workflow-jit-grounding) for instructions).

---

## Lessons Learned Discovery & Storage

> **CRITICAL: The retrospective MUST result in updated AI memory.**
>
> For each lesson identified:
>
> 1. Record the lesson using the `synapse-memory` skill (refer to [synapse-memory](../../../../synapse-memory/SKILL.md#portal-write-workflow) for instructions).
>
> This ensures lessons are persisted in the AI memory system and will be automatically applied in all future sessions.

Confirm to the user:

- Path to retrospective report
- List of lesson entries written to the Knowledge Portal
