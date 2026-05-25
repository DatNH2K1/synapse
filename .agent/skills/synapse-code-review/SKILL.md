---
name: synapse-code-review
description: 'Master Review Suite: Automatically dispatches multiple review layers (Adversarial, Edge-Case, Prose-UI, Security) based on code context. High-fidelity analysis with zero manual configuration.'
metadata:
  author: synapse
  version: "2.8.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Master Code Review Suite

This is the ultimate orchestration layer for all code-related reviews in Synapse. It automatically analyzes code context to trigger the most relevant expert layers while preserving the full technical rigor and all supporting documentation of underlying methodologies.

## 🚦 INTELLIGENCE DISPATCHER

The system uses `scripts/dispatcher.py` to automatically analyze the input and activate the following layers:

- **ALWAYS ACTIVE**: **Adversarial Red-Team** (Baseline skepticism).
- **DETECTED LOGIC** (`if`, `loop`, `math`): **Edge-Case Hunter** (Path tracing).
- **DETECTED UI** (`className`, `style`, `CSS`): **Prose-UI & UX** (Experience audit).
- **DETECTED SENSITIVE** (`token`, `sql`, `auth`): **Security Auditor** (Vulnerability scan).

---

## 🛠️ CORE PROTOCOLS (Full Essence)

### 1. The Three-Stage Review Protocol
*Consolidated from synapse-code-review*

**Stage 1 — Spec Compliance**
- Does code match what was requested?
- MUST pass before Stage 2.

**Stage 2 — Code Quality**
- Standards, security, performance, and naming.

**Stage 3 — Adversarial Red-Team**
- Actively try to break the code. Find security holes, false assumptions, resource exhaustion.

### 2. Edge-Case Path Tracing
*Consolidated from synapse-code-review*

**Method**: Exhaustive path enumeration.
- Walk all branching paths and domain boundaries.
- Identify unhandled nulls, empty inputs, and race conditions.

---

## 📂 FULL REFERENCES (Portable Relative Paths)

For deep-dive analysis, the Master Skill maintains the full original structures of absorbed skills:

- **Adversarial Review (Full Protocol & Stage 3)**: [Original Skill & References](./references/adversarial-review/SKILL.md)
    - Includes: Spec compliance, Red-team methods, Checklist workflows, etc.
- **Edge-Case Hunter**: [Original Skill & Methodology](./references/edge-case-hunter/SKILL.md)
    - Includes: Exhaustive path tracing rules.

## USAGE
Simply request a "code review" or "review these changes." The system will automatically coordinate the layers and provide a unified report.