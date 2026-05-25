---
name: synapse-autoresearch
description: "Autonomous iterative optimization loop — run N iterations against a mechanical metric (coverage, size, errors). Use for improving measurable project metrics automatically."
argument-hint: "[Goal/Metric description]"
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Auto-Research (Iterative Optimization Loop)

Improve measurable project metrics (test coverage, bundle size, ESLint errors) through autonomous, git-tracked experiments.

## Core Protocol

1. **Baseline:** Measure the current metric using a `Verify` command.
2. **Iteration:**
    - Perform ONE atomic change to the code in the defined `Scope`.
    - Commit the change.
    - Run `Verify` to measure the new metric.
    - Run `Guard` to ensure no regressions (e.g., tests still pass).
3. **Keep/Discard:** If the metric improved, KEEP the commit. If not, REVERT.
4. **Learn:** Use the results of the previous iteration to inform the next change.

## Configuration Requirements

- **Goal:** Description of what to improve.
- **Scope:** Glob patterns of files that can be modified.
- **Verify Command:** A shell command that outputs a **single number**.
- **Guard Command:** A regression check (exit 0 = pass).
- **Direction:** `higher` (e.g., coverage) or `lower` (e.g., bundle size).

## Example
```markdown
Goal: Reduce main bundle size below 200KB
Scope: src/**/*.ts, src/**/*.tsx
Verify: npx vite build 2>/dev/null | grep "dist/index" | awk '{print $2}' | sed 's/kB//'
Guard: npx tsc --noEmit
Direction: lower
```

## Constraints
- Requires a clean Git working tree before starting.
- Each iteration must be atomic.
- Sequential execution only.