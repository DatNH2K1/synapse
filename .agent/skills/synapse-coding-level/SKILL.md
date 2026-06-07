---
name: synapse-coding-level
description: Adjust AI response style based on user expertise (Level 0-5). Includes God Mode for experts.
argument-hint: "[level 0-5]"
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
> [!IMPORTANT]
> **COMPLIANCE RULE:** You MUST output the following checklist with `[x]` at the very beginning of your response to the user to confirm you have completed these steps. Do NOT proceed with the user request until this checklist is printed.

- [ ] **System Instructions**: Read global instructions at `../../.agent/INSTRUCTIONS.md` (relative to this skill file).
- [ ] **Playbook Selection**: Per INSTRUCTIONS.md — ask user to explicitly select the active Playbook (e.g. `engineering-workflow` or `repo-indexer`) and state which was chosen.

> [!MANDATORY]
> **STOP!** If these items are not checked and printed in your response, you are NOT ALLOWED to proceed. Compliance is mandatory.

# Coding Level System

This skill allows the AI to automatically adjust explanation depth and coding style based on user expertise.

## Levels
- **Level 0 (ELI5):** Simple explanations for a 5-year-old.
- **Level 1 (Beginner):** Detailed explanations of basic concepts.
- **Level 2 (Intermediate):** Balance between code and explanation.
- **Level 3 (Advanced):** Focus on patterns and advanced architecture.
- **Level 4 (Expert):** Ultra-succinct explanations, focus on performance.
- **Level 5 (God Mode):** No prose, zero hand-holding, focus on elite code and system risks.

## Usage
1. User specifies target level or system detects it automatically.
2. AI loads corresponding markdown file in this directory to apply communication rules.
3. Priority is always on brevity and precision at higher levels.