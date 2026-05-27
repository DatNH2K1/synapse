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

## 🚦 INTELLIGENCE DISPATCHER & SUB-SKILL REGISTRY

When reviewing, you MUST refer to the registry table below and **only load/query the sub-skills whose Activation Criteria match the current task context** (Lazy/Conditional Loading pattern) to prevent token waste and context bloat. Do NOT load sub-skills whose activation criteria are not met.

| Sub-Skill | Portable Path | Primary Role | Activation Criteria |
| :--- | :--- | :--- | :--- |
| **Adversarial Review** | [`./references/adversarial-review/SKILL.md`](./references/adversarial-review/SKILL.md) | Skeptical critique, security audit, assumptions challenge | Always active for Stage 3 reviews |
| **Edge-Case Hunter** | [`./references/edge-case-hunter/SKILL.md`](./references/edge-case-hunter/SKILL.md) | Path tracing, boundary analysis, race conditions | Active on logic detection (`if`, `loop`, `math`) |

---

## 🛠️ ACTIVE INTEGRATION WORKFLOWS

### 1. Three-Stage Review Protocol (Dynamic Integration)
- **Stage 1 & 2 (Compliance & Quality)**: Assess code structure. If any branching paths exist, you **MUST** load and apply the exhaustive path tracing rules from `edge-case-hunter`.
- **Stage 3 (Adversarial Red-Team)**: Actively apply the threat models, security vulnerability vectors, and destructive testing mindsets defined in `adversarial-review`.

### 2. Edge-Case Path Tracing
- When trace logic is triggered, systematically enumerate all input parameters. Use the boundary-value analysis guidelines from `edge-case-hunter` to trace empty inputs, invalid formats, and overflow/null states.

---

## 🔒 AUTOMATED QUALITY CHECKPOINTS

Before submitting a code review report:
- [ ] **Path Traversal Gate**: Confirm all branching logic (`if`, `switch`, loops) has been traced with a corresponding edge-case checklist.
- [ ] **Adversarial Security Sign-off**: Verify that input validation, API error handling, and authorization states have been fuzzed using `adversarial-review` checklists.
- [ ] **Prose Naming Audit**: Ensure variable and function names are self-documenting and match Synapse naming conventions.

---

## 📂 FULL REFERENCES (Portable Relative Paths)

For deep-dive analysis, the Master Skill maintains the full original structures of absorbed skills:

- **Adversarial Review (Full Protocol & Stage 3)**: [Original Skill & References](./references/adversarial-review/SKILL.md)
    - Includes: Spec compliance, Red-team methods, Checklist workflows, etc.
- **Edge-Case Hunter**: [Original Skill & Methodology](./references/edge-case-hunter/SKILL.md)
    - Includes: Exhaustive path tracing rules.

## USAGE
Simply request a "code review" or "review these changes." The system will automatically coordinate the layers, apply the sub-skill checks, and provide a unified report with quality checkpoints.