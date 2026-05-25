---
name: synapse-research-center
description: 'Master Research Center: A unified engine for Domain Analysis, Market Intelligence, Technical Research, and Documentation Lookup.'
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Master Research Center

This skill is the primary knowledge acquisition engine of Synapse. It intelligently dispatches research tasks based on the complexity and domain of the inquiry.

## 🚦 INTELLIGENCE DISPATCHER

The system uses `scripts/dispatcher.py` to automatically detect the type of research required:

- **LAYER 1: DOMAIN & INDUSTRY**
    - Detects: "industry", "domain", "market", "competitor", "business model".
- **LAYER 2: TECHNICAL & ARCHITECTURE**
    - Detects: "technical", "architecture", "framework", "library", "benchmark".
- **LAYER 3: DOCUMENTATION & API**
    - Detects: "docs", "API", "syntax", "how to use", "lookup".

---

## 📂 FULL REFERENCES (Portable Relative Paths)

### Specialized Research Engines
- [Domain Research](./references/domain/SKILL.md)
- [Market Intelligence](./references/market/SKILL.md)
- [Technical Deep-dive](./references/technical/SKILL.md)

### Context & Docs
- [Docs Seeker (LLM.txt Support)](./references/docs-seeker/SKILL.md)
- [Repomix (Codebase Packing)](./references/repomix/SKILL.md)

## USAGE
"Research the e-commerce industry in Vietnam", "Analyze the technical pros/cons of Next.js 15", or "Look up the API for TanStack Query".