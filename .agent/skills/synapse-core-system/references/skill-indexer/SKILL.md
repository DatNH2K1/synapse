---
name: synapse-skill-indexer
description: "Automatically scan and index all Synapse skills. Extract metadata, classify, and update the system's skill manifest."
---

# 🛡️ MANDATORY COMPLIANCE CHECKLIST
- [ ] **JIT Grounding**: Have I retrieved current project context before proceeding?
- [ ] **Memory Persistence**: Have I planned to record insights to the Knowledge Portal?

> [!MANDATORY]
> **STOP!** If the items in the Checklist above are not checked, the Agent is NOT ALLOWED to proceed. Compliance is mandatory for knowledge integrity.

# synapse-skill-indexer

This skill enables Synapse to automatically manage its own skill catalog. It scans the `skills/` directory, reads `SKILL.md` and `synapse-skill-manifest.yaml` files, and generates a unified index.

## Usage

1. Run the `scan_skills.py` script located in this directory.
2. The script will generate a comprehensive overview report or update the system manifest file.
3. Supports skill classification by modules (SYNAPSE, Frontend, Backend, etc.).

## Key Capabilities

- **Scan**: Crawl the skill directory tree.
- **Extract**: Retrieve name, description, and capabilities.
- **Index**: Generate unified JSON or Markdown files for system discovery.