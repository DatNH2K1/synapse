---
name: synapse-coding-level
description: Adjust AI response style based on user expertise (Level 0-5). Includes God Mode for experts.
argument-hint: "[level 0-5]"
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

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