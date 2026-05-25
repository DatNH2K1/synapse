---
name: synapse-security-scan
description: "Scan codebase for security vulnerabilities, hardcoded secrets, and dependency issues. Use when asked to 'security scan', 'audit security', or before releases."
argument-hint: "[scope] [--secrets-only] [--full]"
metadata:
  author: synapse
  version: "1.0.0"
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# Security Scan (Lightweight Audit)

Perform an automated security audit of the codebase to detect secrets, vulnerabilities, and insecure patterns.

## Scan Categories

### 1. Secret Detection
- Scan for API keys, tokens (AWS, GitHub, Stripe), and hardcoded passwords.
- **Rules:** Never output full secret values; redact to `AKIA...XX`.
- **Exclusions:** Skip `.env.example`, `node_modules/`, and `dist/`.

### 2. Dependency Audit
- Run `npm audit` or `pip audit` to find known vulnerabilities in third-party packages.

### 3. Vulnerability Patterns (OWASP)
- **Injection:** Check for unsanitized string concatenation in SQL or command execution.
- **XSS:** Check for `innerHTML` or `dangerouslySetInnerHTML` usage.
- **Insecure Randomness:** Check for `Math.random` in security-sensitive contexts.

## Workflow

1. **Detect Env:** Identify project type (Node, Python, etc.).
2. **Scan Secrets:** Run grep-based search for credential patterns.
3. **Audit Deps:** Run ecosystem-specific audit tools.
4. **Report:** Generate a markdown report summarizing Critical, High, and Medium findings.

## Commands
- `/synapse-security-scan` - Full project scan.
- `/synapse-security-scan --secrets-only` - Focused secret detection.